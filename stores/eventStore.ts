"use client";

import {
  api,
  type Team as ApiTeam,
  type ClassType,
  type GuildEvent,
  type TimeSlot,
  type User
} from "@/lib/api";
import { toast } from "sonner";
import { create } from "zustand";

export interface TeamMember {
  id: string;
  name: string;
  primaryClass: [ClassType, ClassType];
  secondaryClass: [ClassType, ClassType] | null;
  primaryRole: "DPS" | "Healer" | "Tank";
  secondaryRole: "DPS" | "Healer" | "Tank" | null;
  region: "VN" | "NA";
  timeSlots: TimeSlot[];
  notes: string | null;
  apiId: number; // Original backend ID
}

export interface Team {
  id: string;
  apiId: number; // Original backend ID
  name: string;
  day: "saturday" | "sunday";
  members: TeamMember[];
}

type RegionKey = "VN" | "NA";

interface RegionData {
  event: GuildEvent | null;
  availableUsers: TeamMember[];
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp for cache validation
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface GuildWarStore {
  VN: RegionData;
  NA: RegionData;

  // Data fetching
  fetchEvent: (region: RegionKey, forceRefresh?: boolean) => Promise<void>;
  invalidateCache: (region: RegionKey) => void;

  // Admin actions
  addTeam: (
    region: RegionKey,
    name?: string,
    day?: "saturday" | "sunday",
    description?: string
  ) => Promise<void>;
  renameTeam: (
    region: RegionKey,
    teamId: string,
    name: string
  ) => Promise<void>;
  deleteTeam: (region: RegionKey, teamId: string) => Promise<void>;
  assignUserToTeam: (
    region: RegionKey,
    userId: string,
    teamId: string
  ) => Promise<void>;
  removeUserFromTeam: (
    region: RegionKey,
    userId: string,
    teamId: string
  ) => Promise<void>;
  deleteUser: (region: RegionKey, userId: string) => Promise<void>;
  moveUser: (
    region: RegionKey,
    userId: string,
    fromContainer: string,
    toContainer: string
  ) => Promise<void>;

  // User registration
  registerUser: (data: {
    username: string;
    region: "vn" | "na";
    primaryClass: [ClassType, ClassType];
    secondaryClass?: [ClassType, ClassType];
    primaryRole: "dps" | "healer" | "tank";
    secondaryRole?: "dps" | "healer" | "tank";
    timeSlots: TimeSlot[];
    notes?: string;
  }) => Promise<void>;
}

function convertApiRole(
  role: string | null | undefined
): "DPS" | "Healer" | "Tank" | null {
  if (!role) return null;
  const roleMap: Record<string, "DPS" | "Healer" | "Tank"> = {
    dps: "DPS",
    healer: "Healer",
    tank: "Tank"
  };
  return roleMap[role.toLowerCase()] || null;
}

function convertRegion(region: string): "VN" | "NA" {
  return region.toUpperCase() as "VN" | "NA";
}

function userToMember(
  user: User,
  signup?: { timeSlots: TimeSlot[]; notes: string | null }
): TeamMember {
  // primaryRole is required, so we use a default if somehow null
  const primaryRole = convertApiRole(user.primaryRole) || "DPS";

  return {
    id: `user-${user.id}`,
    apiId: user.id,
    name: user.username,
    primaryClass: user.primaryClass,
    secondaryClass: user.secondaryClass || null,
    primaryRole,
    secondaryRole: convertApiRole(user.secondaryRole),
    region: convertRegion(user.region),
    timeSlots: signup?.timeSlots || [],
    notes: signup?.notes || null
  };
}

function apiTeamToTeam(
  apiTeam: ApiTeam,
  signupsMap: Map<number, { timeSlots: TimeSlot[]; notes: string | null }>
): Team {
  return {
    id: `team-${apiTeam.id}`,
    apiId: apiTeam.id,
    name: apiTeam.name,
    day: apiTeam.day,
    members: (apiTeam.members ?? []).map(m =>
      userToMember(m.user, signupsMap.get(m.user.id))
    )
  };
}

const initialRegionData: RegionData = {
  event: null,
  availableUsers: [],
  teams: [],
  isLoading: false,
  error: null,
  lastFetched: null
};

export const useGuildWarStore = create<GuildWarStore>((set, get) => ({
  VN: { ...initialRegionData },
  NA: { ...initialRegionData },

  invalidateCache: (region: RegionKey) => {
    set(state => ({
      [region]: { ...state[region], lastFetched: null }
    }));
  },

  fetchEvent: async (region: RegionKey, forceRefresh = false) => {
    const state = get();
    const regionData = state[region];
    const now = Date.now();

    // Check if cache is still valid
    if (
      !forceRefresh &&
      regionData.lastFetched &&
      now - regionData.lastFetched < CACHE_DURATION &&
      regionData.event !== null
    ) {
      // Cache is still valid, skip fetch
      return;
    }

    // Prevent duplicate requests while loading
    if (regionData.isLoading) {
      return;
    }

    set(state => ({
      [region]: { ...state[region], isLoading: true, error: null }
    }));

    try {
      const apiRegion = region.toLowerCase() as "vn" | "na";
      const event = await api.getCurrentEvent(apiRegion);

      // Create a map of userId to signup info for quick lookup
      const signupsMap = new Map(
        event.signups.map(signup => [
          signup.user.id,
          { timeSlots: signup.timeSlots, notes: signup.notes }
        ])
      );

      // Get all signed-up users with their signup info
      const signedUpUsers = event.signups.map(signup =>
        userToMember(signup.user, {
          timeSlots: signup.timeSlots,
          notes: signup.notes
        })
      );

      // Convert teams with signup info
      const teams = event.teams.map(team => apiTeamToTeam(team, signupsMap));

      // Keep ALL signed up users as available - the UI will filter based on day
      const availableUsers = signedUpUsers;

      set({
        [region]: {
          event,
          availableUsers,
          teams,
          isLoading: false,
          error: null,
          lastFetched: Date.now()
        }
      });
    } catch (error) {
      set(state => ({
        [region]: {
          ...state[region],
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to load event"
        }
      }));
    }
  },

  addTeam: async (
    region: RegionKey,
    name?: string,
    day?: "saturday" | "sunday",
    description?: string
  ) => {
    const state = get();
    const event = state[region].event;
    if (!event) return;

    try {
      const teamName = name || `Team ${state[region].teams.length + 1}`;
      const teamDay = day || "saturday";
      const newTeam = await api.createTeam(
        event.id,
        teamName,
        teamDay,
        description
      );

      // Create signups map from current availableUsers
      const signupsMap = new Map(
        state[region].availableUsers.map(u => [
          u.apiId,
          { timeSlots: u.timeSlots, notes: u.notes }
        ])
      );

      set(state => ({
        [region]: {
          ...state[region],
          teams: [...state[region].teams, apiTeamToTeam(newTeam, signupsMap)],
          lastFetched: null // Invalidate cache
        }
      }));
    } catch (error) {
      console.error("Failed to create team:", error);
      throw error;
    }
  },

  renameTeam: async (region: RegionKey, teamId: string, name: string) => {
    const state = get();
    const team = state[region].teams.find(t => t.id === teamId);
    if (!team) return;

    try {
      await api.updateTeam(team.apiId, { name });

      set(state => ({
        [region]: {
          ...state[region],
          teams: state[region].teams.map(t =>
            t.id === teamId ? { ...t, name } : t
          ),
          lastFetched: null // Invalidate cache
        }
      }));
    } catch (error) {
      console.error("Failed to rename team:", error);
      throw error;
    }
  },

  deleteTeam: async (region: RegionKey, teamId: string) => {
    const state = get();
    const team = state[region].teams.find(t => t.id === teamId);
    if (!team) return;

    try {
      await api.deleteTeam(team.apiId);

      // Don't move members - they're always in availableUsers
      set(state => ({
        [region]: {
          ...state[region],
          teams: state[region].teams.filter(t => t.id !== teamId),
          lastFetched: null // Invalidate cache
        }
      }));
    } catch (error) {
      console.error("Failed to delete team:", error);
      throw error;
    }
  },

  assignUserToTeam: async (
    region: RegionKey,
    userId: string,
    teamId: string
  ) => {
    const state = get();
    const team = state[region].teams.find(t => t.id === teamId);
    const user =
      state[region].availableUsers.find(u => u.id === userId) ||
      state[region].teams.flatMap(t => t.members).find(m => m.id === userId);

    if (!team || !user) return;

    try {
      await api.assignUserToTeam(team.apiId, user.apiId);

      set(state => ({
        [region]: {
          ...state[region],
          // Don't remove from availableUsers - users can be in multiple day teams
          teams: state[region].teams.map(t =>
            t.id === teamId ? { ...t, members: [...t.members, user] } : t
          ),
          lastFetched: null // Invalidate cache
        }
      }));
    } catch (error) {
      console.error("Failed to assign user to team:", error);
      throw error;
    }
  },

  removeUserFromTeam: async (
    region: RegionKey,
    userId: string,
    teamId: string
  ) => {
    const state = get();
    const team = state[region].teams.find(t => t.id === teamId);
    const user = team?.members.find(m => m.id === userId);

    if (!team || !user) return;

    try {
      await api.removeUserFromTeam(team.apiId, user.apiId);

      set(state => ({
        [region]: {
          ...state[region],
          // Don't add to availableUsers - they're always there
          teams: state[region].teams.map(t =>
            t.id === teamId
              ? { ...t, members: t.members.filter(m => m.id !== userId) }
              : t
          ),
          lastFetched: null // Invalidate cache
        }
      }));
    } catch (error) {
      console.error("Failed to remove user from team:", error);
      throw error;
    }
  },

  moveUser: async (
    region: RegionKey,
    userId: string,
    fromContainer: string,
    toContainer: string
  ) => {
    if (fromContainer === toContainer) return;

    const state = get();

    // Find the user
    let user: TeamMember | undefined;
    if (fromContainer === "available") {
      user = state[region].availableUsers.find(u => u.id === userId);
    } else {
      const fromTeam = state[region].teams.find(t => t.id === fromContainer);
      user = fromTeam?.members.find(m => m.id === userId);
    }

    if (!user) return;

    // If moving from a team, remove first
    if (fromContainer !== "available") {
      const fromTeam = state[region].teams.find(t => t.id === fromContainer);
      if (fromTeam) {
        try {
          await api.removeUserFromTeam(fromTeam.apiId, user.apiId);
        } catch (error) {
          console.error("Failed to remove user from team:", error);
          return;
        }
      }
    }

    // If moving to a team, assign
    if (toContainer !== "available") {
      const toTeam = state[region].teams.find(t => t.id === toContainer);
      if (toTeam) {
        try {
          await api.assignUserToTeam(toTeam.apiId, user.apiId);
        } catch (error) {
          console.error("Failed to assign user to team:", error);
          // Refresh to get consistent state
          get().fetchEvent(region);
          return;
        }
      }
    }

    // Update local state
    set(state => {
      let newTeams = [...state[region].teams];

      // Remove from source team (if moving from a team)
      if (fromContainer !== "available") {
        newTeams = newTeams.map(t =>
          t.id === fromContainer
            ? { ...t, members: t.members.filter(m => m.id !== userId) }
            : t
        );
      }

      // Add to destination team (if moving to a team)
      if (toContainer !== "available") {
        newTeams = newTeams.map(t =>
          t.id === toContainer ? { ...t, members: [...t.members, user!] } : t
        );
      }

      return {
        [region]: {
          ...state[region],
          // availableUsers stays the same - always contains all signed up users
          teams: newTeams,
          lastFetched: null // Invalidate cache
        }
      };
    });
  },

  deleteUser: async (region: RegionKey, userId: string) => {
    const state = get();
    const user = state[region].availableUsers.find(u => u.id === userId);

    // Only allow deletion if user is in available list (not in a team)
    if (!user) {
      toast.warning("User not found or already assigned to a team");
      return;
    }

    try {
      await api.deleteUser(user.apiId);

      set(state => ({
        [region]: {
          ...state[region],
          availableUsers: state[region].availableUsers.filter(
            u => u.id !== userId
          ),
          lastFetched: null // Invalidate cache
        }
      }));
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  },

  registerUser: async data => {
    try {
      await api.signup(data);
      // Force refresh to show the new user
      const region = data.region.toUpperCase() as RegionKey;
      get().invalidateCache(region);
      await get().fetchEvent(region, true);
    } catch (error) {
      throw error;
    }
  }
}));
