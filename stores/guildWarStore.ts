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

const allMembers: Member[] = [
  {
    id: "4829301745",
    name: "BaiTian",
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    region: "VN"
  },
  {
    id: "1938475620",
    name: "Băng",
    weapon: "Quạt Dù Heal",
    role: "Healer",
    region: "VN"
  },
  {
    id: "5601928374",
    name: "BanhQueMaTon",
    weapon: "9K/9T",
    role: "DPS",
    region: "VN"
  },
  {
    id: "9182736450",
    name: "BbiBeoChun",
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    region: "VN"
  },
  {
    id: "3748291056",
    name: "Bennybooadudu (Khanh)",
    weapon: "Mo blade/Stonesplits",
    role: "Tank",
    region: "NA"
  },
  {
    id: "6501928374",
    name: "Càphêđen",
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    region: "NA"
  },
  {
    id: "2847561930",
    name: "Catcrazy",
    weapon: "Quạt/Dù",
    role: "Healer",
    region: "VN"
  },
  {
    id: "9374610285",
    name: "ChaseNg",
    weapon: "9k",
    role: "DPS",
    region: "NA"
  },
  {
    id: "1029384756",
    name: "Cock",
    weapon: "Mo blade/Stonesplits",
    role: "Healer",
    region: "NA"
  },
  {
    id: "5647382910",
    name: "CoolFrogking",
    weapon: "9k",
    role: "DPS",
    region: "NA"
  },
  {
    id: "9182736401",
    name: "cotrung",
    weapon: "9k",
    role: "DPS",
    region: "VN"
  },
  {
    id: "3746501928",
    name: "Cường Chích(Chichchoebong)",
    weapon: "Thương/quạt",
    role: "Healer",
    region: "VN"
  },
  {
    id: "8473629105",
    name: "dacdaothanhtien",
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    region: "VN"
  },
  {
    id: "5647382911",
    name: "DaruOp",
    weapon: "Quạt dù Dame/Heal",
    role: "Healer",
    region: "VN"
  },
  {
    id: "2938475610",
    name: "DziU",
    weapon: "9k/9T",
    role: "DPS",
    region: "NA"
  },
  {
    id: "8475610293",
    name: "Fengcha",
    weapon: "Quạt dù",
    role: "DPS",
    region: "NA"
  },
  {
    id: "3748291057",
    name: "GameTapTang",
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    region: "VN"
  },
  {
    id: "9182736402",
    name: "Gintsugi",
    weapon: "song đao/Bamboocut",
    role: "DPS",
    region: "NA"
  },
  {
    id: "5647382912",
    name: "gnartpeih",
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    region: "VN"
  },
  {
    id: "1029384757",
    name: "Gnea",
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    region: "VN"
  },
  {
    id: "9182736403",
    name: "HarryMelody",
    weapon: "Đại Đao/ Stoneplits",
    role: "Tank",
    region: "VN"
  },
  {
    id: "3746501929",
    name: "HawkEyes",
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    region: "NA"
  },
  {
    id: "8473629106",
    name: "HẽngXingg",
    weapon: "Hành / Quạt",
    role: "Healer",
    region: "NA"
  },
  {
    id: "2938475611",
    name: "Henry",
    weapon: "9k/heaven quaker/vo danh kiem",
    role: "DPS",
    region: "NA"
  },
  {
    id: "5647382913",
    name: "Hong Tian'an",
    weapon: "Dù/Quạt Silkbind",
    role: "Healer",
    region: "NA"
  },
  {
    id: "9182736404",
    name: "Leerik",
    weapon: "9k/kt",
    role: "DPS",
    region: "NA"
  },
  {
    id: "3748291058",
    name: "Lefranc",
    weapon: "Đại Đao/ Stoneplits",
    role: "Tank",
    region: "VN"
  },
  {
    id: "8475610294",
    name: "Lemint",
    weapon: "9k Kiếm với thương",
    role: "DPS",
    region: "VN"
  },
  {
    id: "1029384758",
    name: "Lib'hydserrata",
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    region: "NA"
  },
  {
    id: "9182736405",
    name: "LittleKuma",
    weapon: "Đại Đao/ Stoneplits",
    role: "Tank",
    region: "NA"
  },
  {
    id: "3746501930",
    name: "louvii",
    weapon: "song đao/Bamboocut",
    role: "DPS",
    region: "NA"
  },
  {
    id: "8473629107",
    name: "LoveFQ",
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    region: "NA"
  },
  {
    id: "2938475612",
    name: "LyMacSau",
    weapon: "Nameless Kiếm / Dù",
    role: "DPS",
    region: "NA"
  },
  {
    id: "5647382914",
    name: "meoconus",
    weapon: "9k/9 thương",
    role: "DPS",
    region: "NA"
  },
  {
    id: "9182736406",
    name: "Micay",
    weapon: "9K/Bellstrike",
    role: "DPS",
    region: "NA"
  },
  {
    id: "3748291059",
    name: "michaele",
    weapon: "vô danh combo",
    role: "DPS",
    region: "NA"
  },
  {
    id: "8475610295",
    name: "Mintz",
    weapon: "Quạt dù",
    role: "DPS",
    region: "VN"
  },
  {
    id: "1029384759",
    name: "Moongle (Bundau)",
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    region: "NA"
  },
  {
    id: "9182736407",
    name: "MrAresS",
    weapon: "9K/Bellstrike",
    role: "DPS",
    region: "VN"
  },
  {
    id: "3746501931",
    name: "Myntz",
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    region: "VN"
  },
  {
    id: "8473629108",
    name: "Nubt",
    weapon: "Deluge/Stone",
    role: "Healer",
    region: "NA"
  },
  {
    id: "2938475613",
    name: "P-Hayashi",
    weapon: "9K/Bellstrike",
    role: "DPS",
    region: "VN"
  },
  {
    id: "5647382915",
    name: "Pánh",
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    region: "NA"
  },
  {
    id: "9182736408",
    name: "PhuHua",
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    region: "NA"
  },
  {
    id: "3748291060",
    name: "Railgun",
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    region: "NA"
  },
  {
    id: "8475610296",
    name: "RuanYiHui",
    weapon: "9K/Vô danh",
    role: "DPS",
    region: "NA"
  },
  {
    id: "1029384760",
    name: "shiromi",
    weapon: "Quạt dù/Silkbind",
    role: "Healer",
    region: "VN"
  },
  {
    id: "9182736409",
    name: "Souo",
    weapon: "9k",
    role: "DPS",
    region: "VN"
  },
  {
    id: "3746501932",
    name: "TedP",
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    region: "NA"
  },
  {
    id: "8473629109",
    name: "ThapLong",
    weapon: "Đại Đao/ Stoneplits",
    role: "Tank",
    region: "VN"
  },
  {
    id: "2938475614",
    name: "TitaniumD",
    weapon: "Dù quạt",
    role: "DPS",
    region: "NA"
  },
  {
    id: "5647382916",
    name: "TuNaSaga",
    weapon: "Quạt dù",
    role: "Healer",
    region: "NA"
  },
  {
    id: "9182736410",
    name: "UnveiL",
    weapon: "vô danh combo",
    role: "DPS",
    region: "NA"
  },
  {
    id: "3748291061",
    name: "Urbby",
    weapon: "Quạt/dù",
    role: "Healer",
    region: "NA"
  },
  {
    id: "8475610297",
    name: "VanGia",
    weapon: "Quạt Dù/Silkbind",
    role: "Healer",
    region: "NA"
  },
  {
    id: "1029384761",
    name: "Vinh 荒牛行",
    weapon: "Quạt dù",
    role: "DPS",
    region: "NA"
  },
  {
    id: "9182736411",
    name: "VipUnknown",
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    region: "VN"
  },
  {
    id: "3746501933",
    name: "Woandere",
    weapon: "Vô danh / Bellstrike",
    role: "DPS",
    region: "NA"
  },
  {
    id: "8473629110",
    name: "XiaoLynn",
    weapon: "9K/Bellstrike",
    role: "DPS",
    region: "VN"
  },
  {
    id: "2938475615",
    name: "XiiaoWiien",
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    region: "VN"
  },
  {
    id: "5647382917",
    name: "xYenThanhx",
    weapon: "Dù Thương/Bellstrike",
    role: "DPS",
    region: "NA"
  },
  {
    id: "9182736412",
    name: "YeraKukulin",
    weapon: "Đại Đao/ Thương Tank",
    role: "Tank",
    region: "NA"
  },
  {
    id: "3748291062",
    name: "Yuennu",
    weapon: "vo danh",
    role: "DPS",
    region: "NA"
  },
  {
    id: "8475610298",
    name: "Yuezia",
    weapon: "Song đao/Bamboocut",
    role: "DPS",
    region: "VN"
  },
  {
    id: "1029384762",
    name: "Zedaz",
    weapon: "Đại Đao/ Stoneplits",
    role: "Tank",
    region: "VN"
  },
  {
    id: "9182736413",
    name: "ZoMhym",
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    region: "VN"
  },
  {
    id: "3746501934",
    name: "ZzShamanzZ",
    weapon: "Song Đao",
    role: "DPS",
    region: "NA"
  },
  {
    id: "8473629111",
    name: "冰藍寧",
    weapon: "Quạt Dù/Silkbind",
    role: "Healer",
    region: "VN"
  },
  {
    id: "2938475616",
    name: "jingne",
    weapon: "9 kiếm / 9 thương",
    role: "DPS",
    region: "VN"
  },
  {
    id: "5647382918",
    name: "shiromi",
    weapon: "Quạt dù",
    role: "DPS",
    region: "NA"
  },
  {
    id: "9182736414",
    name: "MumuFu",
    weapon: "Cửu Kiếm/Cửu Thương",
    role: "DPS",
    region: "VN"
  },
  {
    id: "3748291063",
    name: "Musez",
    weapon: "Cửu Kiếm/Cửu Thương",
    role: "DPS",
    region: "NA"
  },
  {
    id: "8475610299",
    name: "PhamNhanThuHai",
    weapon: "Đại Đao/ Stoneplits",
    role: "Tank",
    region: "VN"
  },
  {
    id: "1029384763",
    name: "HànThiênPhong",
    weapon: "9K9T",
    role: "DPS",
    region: "NA"
  }
];

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
