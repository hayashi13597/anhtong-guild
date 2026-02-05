import { Member } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Team {
  id: string;
  name: string;
  members: Member[];
}

type RegionKey = "VN" | "NA";

interface RegionData {
  availableUsers: Member[];
  teams: Team[];
}

interface TeamStore {
  VN: RegionData;
  NA: RegionData;
  setAvailableUsers: (region: RegionKey, users: Member[]) => void;
  setTeams: (region: RegionKey, teams: Team[]) => void;
  addTeam: (region: RegionKey) => void;
  renameTeam: (region: RegionKey, teamId: string, name: string) => void;
  moveUser: (
    region: RegionKey,
    userId: string,
    fromContainer: string,
    toContainer: string,
    newIndex?: number
  ) => void;
  removeUserFromTeam: (
    region: RegionKey,
    teamId: string,
    userId: string
  ) => void;
}

const allMembers: Member[] = [];

const vnMembers = allMembers.filter(m => m.region === "VN");
const naMembers = allMembers.filter(m => m.region === "NA");

const defaultTeams: Team[] = [
  { id: "t1", name: "Team 1", members: [] },
  { id: "t2", name: "Team 2", members: [] },
  { id: "t3", name: "Team 3", members: [] }
];

export const useTeamStore = create<TeamStore>()(
  persist(
    set => ({
      VN: {
        availableUsers: vnMembers,
        teams: defaultTeams.map(t => ({ ...t, id: `VN-${t.id}` }))
      },
      NA: {
        availableUsers: naMembers,
        teams: defaultTeams.map(t => ({ ...t, id: `NA-${t.id}` }))
      },
      setAvailableUsers: (region, users) =>
        set(state => ({
          [region]: { ...state[region], availableUsers: users }
        })),
      setTeams: (region, teams) =>
        set(state => ({
          [region]: { ...state[region], teams }
        })),
      addTeam: region =>
        set(state => {
          const regionData = state[region];
          const teamName = regionData.teams.length + 1;
          return {
            [region]: {
              ...regionData,
              teams: [
                ...regionData.teams,
                {
                  id: `${region}-t${Date.now()}`,
                  name: `Team ${teamName}`,
                  members: []
                }
              ]
            }
          };
        }),
      renameTeam: (region, teamId, name) =>
        set(state => ({
          [region]: {
            ...state[region],
            teams: state[region].teams.map(t =>
              t.id === teamId ? { ...t, name } : t
            )
          }
        })),
      moveUser: (region, userId, fromContainer, toContainer, newIndex) =>
        set(state => {
          const regionData = state[region];
          let user: Member | undefined;
          const newAvailableUsers = [...regionData.availableUsers];
          const newTeams = regionData.teams.map(t => ({
            ...t,
            members: [...t.members]
          }));

          // Remove from source
          if (fromContainer === "available") {
            const userIndex = newAvailableUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
              user = newAvailableUsers[userIndex];
              newAvailableUsers.splice(userIndex, 1);
            }
          } else {
            const teamIndex = newTeams.findIndex(t => t.id === fromContainer);
            if (teamIndex !== -1) {
              const userIndex = newTeams[teamIndex].members.findIndex(
                u => u.id === userId
              );
              if (userIndex !== -1) {
                user = newTeams[teamIndex].members[userIndex];
                newTeams[teamIndex].members.splice(userIndex, 1);
              }
            }
          }

          if (!user) return state;

          // Add to destination
          if (toContainer === "available") {
            if (newIndex !== undefined) {
              newAvailableUsers.splice(newIndex, 0, user);
            } else {
              newAvailableUsers.push(user);
            }
          } else {
            const teamIndex = newTeams.findIndex(t => t.id === toContainer);
            if (teamIndex !== -1) {
              if (newIndex !== undefined) {
                newTeams[teamIndex].members.splice(newIndex, 0, user);
              } else {
                newTeams[teamIndex].members.push(user);
              }
            }
          }

          return {
            [region]: {
              availableUsers: newAvailableUsers,
              teams: newTeams
            }
          };
        }),
      removeUserFromTeam: (region, teamId, userId) =>
        set(state => {
          const regionData = state[region];
          const team = regionData.teams.find(t => t.id === teamId);
          const user = team?.members.find(u => u.id === userId);

          if (!user) return state;

          return {
            [region]: {
              teams: regionData.teams.map(t =>
                t.id === teamId
                  ? { ...t, members: t.members.filter(u => u.id !== userId) }
                  : t
              ),
              availableUsers: [...regionData.availableUsers, user]
            }
          };
        })
    }),
    {
      name: "guild-war-storage"
    }
  )
);
