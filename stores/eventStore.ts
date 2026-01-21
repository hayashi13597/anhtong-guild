"use client";

import {
  api,
  type Team as ApiTeam,
  type GuildEvent,
  type User
} from "@/lib/api";
import { create } from "zustand";

export interface TeamMember {
  id: string;
  name: string;
  classes: string | null;
  role: "DPS" | "Healer" | "Tank" | null;
  region: "VN" | "NA";
  apiId: number; // Original backend ID
}

export interface Team {
  id: string;
  apiId: number; // Original backend ID
  name: string;
  members: TeamMember[];
}

type RegionKey = "VN" | "NA";

interface RegionData {
  event: GuildEvent | null;
  availableUsers: TeamMember[];
  teams: Team[];
  isLoading: boolean;
  error: string | null;
}

interface GuildWarStore {
  VN: RegionData;
  NA: RegionData;

  // Data fetching
  fetchEvent: (region: RegionKey) => Promise<void>;

  // Admin actions
  addTeam: (region: RegionKey, name?: string) => Promise<void>;
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
    classes?: string;
    role?: "dps" | "healer" | "tank";
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

function userToMember(user: User): TeamMember {
  return {
    id: `user-${user.id}`,
    apiId: user.id,
    name: user.username,
    classes: user.classes ?? null,
    role: convertApiRole(user.role),
    region: convertRegion(user.region)
  };
}

function apiTeamToTeam(apiTeam: ApiTeam): Team {
  return {
    id: `team-${apiTeam.id}`,
    apiId: apiTeam.id,
    name: apiTeam.name,
    members: (apiTeam.members ?? []).map(m => userToMember(m.user))
  };
}

const initialRegionData: RegionData = {
  event: null,
  availableUsers: [],
  teams: [],
  isLoading: false,
  error: null
};

export const useGuildWarStore = create<GuildWarStore>((set, get) => ({
  VN: { ...initialRegionData },
  NA: { ...initialRegionData },

  fetchEvent: async (region: RegionKey) => {
    set(state => ({
      [region]: { ...state[region], isLoading: true, error: null }
    }));

    try {
      const apiRegion = region.toLowerCase() as "vn" | "na";
      const event = await api.getCurrentEvent(apiRegion);

      // Get all signed-up users
      const signedUpUsers = event.signups.map(signup =>
        userToMember(signup.user)
      );

      // Get users who are already in teams
      const assignedUserIds = new Set<string>();
      const teams = event.teams.map(team => {
        const converted = apiTeamToTeam(team);
        converted.members.forEach(m => assignedUserIds.add(m.id));
        return converted;
      });

      // Available users = signed up but not in any team
      const availableUsers = signedUpUsers.filter(
        u => !assignedUserIds.has(u.id)
      );

      set({
        [region]: {
          event,
          availableUsers,
          teams,
          isLoading: false,
          error: null
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

  addTeam: async (region: RegionKey, name?: string) => {
    const state = get();
    const event = state[region].event;
    if (!event) return;

    try {
      const teamName = name || `Team ${state[region].teams.length + 1}`;
      const newTeam = await api.createTeam(event.id, teamName);

      set(state => ({
        [region]: {
          ...state[region],
          teams: [...state[region].teams, apiTeamToTeam(newTeam)]
        }
      }));
    } catch (error) {
      console.error("Failed to create team:", error);
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
          )
        }
      }));
    } catch (error) {
      console.error("Failed to rename team:", error);
    }
  },

  deleteTeam: async (region: RegionKey, teamId: string) => {
    const state = get();
    const team = state[region].teams.find(t => t.id === teamId);
    if (!team) return;

    try {
      await api.deleteTeam(team.apiId);

      // Move members back to available
      const membersToMove = team.members;

      set(state => ({
        [region]: {
          ...state[region],
          teams: state[region].teams.filter(t => t.id !== teamId),
          availableUsers: [...state[region].availableUsers, ...membersToMove]
        }
      }));
    } catch (error) {
      console.error("Failed to delete team:", error);
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
          availableUsers: state[region].availableUsers.filter(
            u => u.id !== userId
          ),
          teams: state[region].teams.map(t =>
            t.id === teamId ? { ...t, members: [...t.members, user] } : t
          )
        }
      }));
    } catch (error) {
      console.error("Failed to assign user to team:", error);
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
          availableUsers: [...state[region].availableUsers, user],
          teams: state[region].teams.map(t =>
            t.id === teamId
              ? { ...t, members: t.members.filter(m => m.id !== userId) }
              : t
          )
        }
      }));
    } catch (error) {
      console.error("Failed to remove user from team:", error);
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
      let newAvailable = [...state[region].availableUsers];
      let newTeams = [...state[region].teams];

      // Remove from source
      if (fromContainer === "available") {
        newAvailable = newAvailable.filter(u => u.id !== userId);
      } else {
        newTeams = newTeams.map(t =>
          t.id === fromContainer
            ? { ...t, members: t.members.filter(m => m.id !== userId) }
            : t
        );
      }

      // Add to destination
      if (toContainer === "available") {
        newAvailable.push(user!);
      } else {
        newTeams = newTeams.map(t =>
          t.id === toContainer ? { ...t, members: [...t.members, user!] } : t
        );
      }

      return {
        [region]: {
          ...state[region],
          availableUsers: newAvailable,
          teams: newTeams
        }
      };
    });
  },

  deleteUser: async (region: RegionKey, userId: string) => {
    const state = get();
    const user = state[region].availableUsers.find(u => u.id === userId);

    // Only allow deletion if user is in available list (not in a team)
    if (!user) {
      console.error("User not found or already assigned to a team");
      return;
    }

    try {
      await api.deleteUser(user.apiId);

      set(state => ({
        [region]: {
          ...state[region],
          availableUsers: state[region].availableUsers.filter(
            u => u.id !== userId
          )
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
      // Refresh the event to show the new user
      const region = data.region.toUpperCase() as RegionKey;
      get().fetchEvent(region);
    } catch (error) {
      throw error;
    }
  }
}));
