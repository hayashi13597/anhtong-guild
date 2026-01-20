"use client";

import { MembersFilter } from "@/components/members/Filter";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { useMemo, useState } from "react";

type BadgeColor = "blue" | "green" | "yellow" | "red";
type Role = "DPS" | "Healer" | "Tank";
type Status = "Core" | "Flex";
type Region = "NA" | "EU" | "VN";

const getColorForBadge = (badgeColor: BadgeColor | Role | Status | Region) => {
  switch (badgeColor) {
    case "blue":
    case "DPS":
    case "NA":
      return "bg-blue-200 text-blue-600";
    case "green":
    case "Healer":
      return "bg-green-200 text-green-600";
    case "yellow":
    case "Tank":
      return "bg-yellow-200 text-yellow-600";
    case "red":
    case "Core":
    case "VN":
      return "bg-red-200 text-red-600";
    case "Flex":
      return "bg-purple-200 text-purple-600";
    default:
      return "bg-gray-200 text-gray-600";
  }
};

export type Member = {
  id: string;
  name: string;
  level: number;
  weapon: string;
  role: Role;
  status: Status;
  region: Region;
};

const members: Member[] = [
  {
    id: "4829301745",
    name: "BaiTian",
    level: 75,
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    status: "Core",
    region: "VN"
  },
  {
    id: "1938475620",
    name: "Băng",
    level: 75,
    weapon: "Quạt Dù Heal",
    role: "Healer",
    status: "Flex",
    region: "VN"
  },
  {
    id: "5601928374",
    name: "BanhQueMaTon",
    level: 75,
    weapon: "9K/9T",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "9182736450",
    name: "BbiBeoChun",
    level: 75,
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    status: "Core",
    region: "VN"
  },
  {
    id: "3748291056",
    name: "Bennybooadudu (Khanh)",
    level: 75,
    weapon: "Mo blade/Stonesplits",
    role: "Tank",
    status: "Flex",
    region: "NA"
  },
  {
    id: "6501928374",
    name: "Càphêđen",
    level: 75,
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "2847561930",
    name: "Catcrazy",
    level: 75,
    weapon: "Quạt/Dù",
    role: "Healer",
    status: "Core",
    region: "VN"
  },
  {
    id: "9374610285",
    name: "ChaseNg",
    level: 75,
    weapon: "9k",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "1029384756",
    name: "Cock",
    level: 75,
    weapon: "Mo blade/Stonesplits",
    role: "Healer",
    status: "Flex",
    region: "NA"
  },
  {
    id: "5647382910",
    name: "CoolFrogking",
    level: 75,
    weapon: "9k",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "9182736401",
    name: "cotrung",
    level: 75,
    weapon: "9k",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "3746501928",
    name: "Cường Chích(Chichchoebong)",
    level: 75,
    weapon: "Thương/quạt",
    role: "Healer",
    status: "Flex",
    region: "VN"
  },
  {
    id: "8473629105",
    name: "dacdaothanhtien",
    level: 75,
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    status: "Core",
    region: "VN"
  },
  {
    id: "5647382911",
    name: "DaruOp",
    level: 75,
    weapon: "Quạt dù Dame/Heal",
    role: "Healer",
    status: "Core",
    region: "VN"
  },
  {
    id: "2938475610",
    name: "DziU",
    level: 75,
    weapon: "9k/9T",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "8475610293",
    name: "Fengcha",
    level: 75,
    weapon: "Quạt dù",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "3748291057",
    name: "GameTapTang",
    level: 75,
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "9182736402",
    name: "Gintsugi",
    level: 75,
    weapon: "song đao/Bamboocut",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "5647382912",
    name: "gnartpeih",
    level: 75,
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "1029384757",
    name: "Gnea",
    level: 75,
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    status: "Core",
    region: "VN"
  },
  {
    id: "9182736403",
    name: "HarryMelody",
    level: 75,
    weapon: "Đại Đao/ Stoneplits",
    role: "Tank",
    status: "Core",
    region: "VN"
  },
  {
    id: "3746501929",
    name: "HawkEyes",
    level: 75,
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "8473629106",
    name: "HẽngXingg",
    level: 75,
    weapon: "Hành / Quạt",
    role: "Healer",
    status: "Core",
    region: "NA"
  },
  {
    id: "2938475611",
    name: "Henry",
    level: 75,
    weapon: "9k/heaven quaker/vo danh kiem",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "5647382913",
    name: "Hong Tian'an",
    level: 75,
    weapon: "Dù/Quạt Silkbind",
    role: "Healer",
    status: "Flex",
    region: "NA"
  },
  {
    id: "9182736404",
    name: "Leerik",
    level: 75,
    weapon: "9k/kt",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "3748291058",
    name: "Lefranc",
    level: 75,
    weapon: "Đại Đao/ Stoneplits",
    role: "Tank",
    status: "Core",
    region: "VN"
  },
  {
    id: "8475610294",
    name: "Lemint",
    level: 75,
    weapon: "9k Kiếm với thương",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "1029384758",
    name: "Lib'hydserrata",
    level: 75,
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "9182736405",
    name: "LittleKuma",
    level: 75,
    weapon: "Đại Đao/ Stoneplits",
    role: "Tank",
    status: "Core",
    region: "NA"
  },
  {
    id: "3746501930",
    name: "louvii",
    level: 75,
    weapon: "song đao/Bamboocut",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "8473629107",
    name: "LoveFQ",
    level: 75,
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "2938475612",
    name: "LyMacSau",
    level: 75,
    weapon: "Nameless Kiếm / Dù",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "5647382914",
    name: "meoconus",
    level: 75,
    weapon: "9k/9 thương",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "9182736406",
    name: "Micay",
    level: 75,
    weapon: "9K/Bellstrike",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "3748291059",
    name: "michaele",
    level: 75,
    weapon: "vô danh combo",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "8475610295",
    name: "Mintz",
    level: 75,
    weapon: "Quạt dù",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "1029384759",
    name: "Moongle (Bundau)",
    level: 75,
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "9182736407",
    name: "MrAresS",
    level: 75,
    weapon: "9K/Bellstrike",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "3746501931",
    name: "Myntz",
    level: 75,
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "8473629108",
    name: "Nubt",
    level: 75,
    weapon: "Deluge/Stone",
    role: "Healer",
    status: "Core",
    region: "NA"
  },
  {
    id: "2938475613",
    name: "P-Hayashi",
    level: 75,
    weapon: "9K/Bellstrike",
    role: "DPS",
    status: "Core",
    region: "VN"
  },
  {
    id: "5647382915",
    name: "Pánh",
    level: 75,
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "9182736408",
    name: "PhuHua",
    level: 75,
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "3748291060",
    name: "Railgun",
    level: 75,
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "8475610296",
    name: "RuanYiHui",
    level: 75,
    weapon: "9K/Vô danh",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "1029384760",
    name: "shiromi",
    level: 75,
    weapon: "Quạt dù/Silkbind",
    role: "Healer",
    status: "Core",
    region: "VN"
  },
  {
    id: "9182736409",
    name: "Souo",
    level: 75,
    weapon: "9k",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "3746501932",
    name: "TedP",
    level: 75,
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "8473629109",
    name: "ThapLong",
    level: 75,
    weapon: "Đại Đao/ Stoneplits",
    role: "Tank",
    status: "Core",
    region: "VN"
  },
  {
    id: "2938475614",
    name: "TitaniumD",
    level: 75,
    weapon: "Dù quạt",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "5647382916",
    name: "TuNaSaga",
    level: 75,
    weapon: "Quạt dù",
    role: "Healer",
    status: "Flex",
    region: "NA"
  },
  {
    id: "9182736410",
    name: "UnveiL",
    level: 75,
    weapon: "vô danh combo",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "3748291061",
    name: "Urbby",
    level: 75,
    weapon: "Quạt/dù",
    role: "Healer",
    status: "Core",
    region: "NA"
  },
  {
    id: "8475610297",
    name: "VanGia",
    level: 75,
    weapon: "Quạt Dù/Silkbind",
    role: "Healer",
    status: "Core",
    region: "NA"
  },
  {
    id: "1029384761",
    name: "Vinh 荒牛行",
    level: 75,
    weapon: "Quạt dù",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "9182736411",
    name: "VipUnknown",
    level: 75,
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "3746501933",
    name: "Woandere",
    level: 75,
    weapon: "Vô danh / Bellstrike",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "8473629110",
    name: "XiaoLynn",
    level: 75,
    weapon: "9K/Bellstrike",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "2938475615",
    name: "XiiaoWiien",
    level: 75,
    weapon: "Quạt dù/Silkbind",
    role: "DPS",
    status: "Core",
    region: "VN"
  },
  {
    id: "5647382917",
    name: "xYenThanhx",
    level: 75,
    weapon: "Dù Thương/Bellstrike",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "9182736412",
    name: "YeraKukulin",
    level: 75,
    weapon: "Đại Đao/ Thương Tank",
    role: "Tank",
    status: "Core",
    region: "NA"
  },
  {
    id: "3748291062",
    name: "Yuennu",
    level: 75,
    weapon: "vo danh",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "8475610298",
    name: "Yuezia",
    level: 75,
    weapon: "Song đao/Bamboocut",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "1029384762",
    name: "Zedaz",
    level: 75,
    weapon: "Đại Đao/ Stoneplits",
    role: "Tank",
    status: "Core",
    region: "VN"
  },
  {
    id: "9182736413",
    name: "ZoMhym",
    level: 75,
    weapon: "Vô danh/Bellstrike",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "3746501934",
    name: "ZzShamanzZ",
    level: 75,
    weapon: "Song Đao",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "8473629111",
    name: "冰藍寧",
    level: 75,
    weapon: "Quạt Dù/Silkbind",
    role: "Healer",
    status: "Flex",
    region: "VN"
  },
  {
    id: "2938475616",
    name: "jingne",
    level: 75,
    weapon: "9 kiếm / 9 thương",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "5647382918",
    name: "shiromi",
    level: 75,
    weapon: "Quạt dù",
    role: "DPS",
    status: "Core",
    region: "NA"
  },
  {
    id: "9182736414",
    name: "MumuFu",
    level: 75,
    weapon: "Cửu Kiếm/Cửu Thương",
    role: "DPS",
    status: "Flex",
    region: "VN"
  },
  {
    id: "3748291063",
    name: "Musez",
    level: 75,
    weapon: "Cửu Kiếm/Cửu Thương",
    role: "DPS",
    status: "Flex",
    region: "NA"
  },
  {
    id: "8475610299",
    name: "PhamNhanThuHai",
    level: 75,
    weapon: "Đại Đao/ Stoneplits",
    role: "Tank",
    status: "Core",
    region: "VN"
  },
  {
    id: "1029384763",
    name: "HànThiênPhong",
    level: 75,
    weapon: "9K9T",
    role: "DPS",
    status: "Flex",
    region: "NA"
  }
];

const MembersPage = () => {
  const [filters, setFilters] = useState({
    name: "",
    id: "",
    status: "",
    role: "",
    region: ""
  });

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesName =
        member.name.toLowerCase().includes(filters.name.toLowerCase()) ||
        filters.name === "";
      const matchesId = member.id.includes(filters.id) || filters.id === "";
      const matchesStatus =
        filters.status === "all" ||
        member.status === filters.status ||
        filters.status === "";
      const matchesRole =
        filters.role === "all" ||
        member.role === filters.role ||
        filters.role === "";
      const matchesRegion =
        filters.region === "all" ||
        member.region === filters.region ||
        filters.region === "";

      return (
        matchesName &&
        matchesId &&
        matchesStatus &&
        matchesRole &&
        matchesRegion
      );
    });
  }, [filters]);

  const handleReset = () => {
    setFilters({
      name: "",
      id: "",
      status: "",
      role: "",
      region: ""
    });
  };

  return (
    <main className="max-w-7xl mx-auto py-10 lg:py-20 space-y-10">
      <h1 className="text-4xl font-bold text-center">Danh Sách Thành Viên</h1>

      {/* Filter */}
      <MembersFilter
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
      />

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredMembers.length} of {members.length} members
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMembers && filteredMembers.length > 0 ? (
            filteredMembers.map(member => (
              <Card key={member.id}>
                <CardHeader className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    ID: {member.id}
                  </span>
                  <Badge className={getColorForBadge(member.region)}>
                    {member.region}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2 flex-1">
                  <h2 className="text-2xl font-bold">{member.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Level {member.level}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.weapon}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Badge className={getColorForBadge(member.role)}>
                    {member.role}
                  </Badge>
                  <Badge className={getColorForBadge(member.status)}>
                    {member.status}
                  </Badge>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                No members found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MembersPage;
