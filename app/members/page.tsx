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
type Region = "NA" | "EU" | "VN";

const getColorForBadge = (badgeColor: BadgeColor | Role | Region) => {
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
    case "VN":
      return "bg-red-200 text-red-600";
    default:
      return "bg-gray-200 text-gray-600";
  }
};

export type Member = {
  id: string;
  name: string;
  weapon: string;
  role: Role;
  region: Region;
};

const members: Member[] = [
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

const MembersPage = () => {
  const [filters, setFilters] = useState({
    name: "",
    id: "",
    role: "",
    region: ""
  });

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesName =
        member.name.toLowerCase().includes(filters.name.toLowerCase()) ||
        filters.name === "";
      const matchesId = member.id.includes(filters.id) || filters.id === "";
      const matchesRole =
        filters.role === "all" ||
        member.role === filters.role ||
        filters.role === "";
      const matchesRegion =
        filters.region === "all" ||
        member.region === filters.region ||
        filters.region === "";

      return matchesName && matchesId && matchesRole && matchesRegion;
    });
  }, [filters]);

  const handleReset = () => {
    setFilters({
      name: "",
      id: "",
      role: "all",
      region: "all"
    });
  };

  return (
    <main className="max-w-7xl mx-auto py-10 lg:py-20 space-y-10">
      <h1 className="text-4xl font-bold text-center">Thành Viên</h1>

      {/* Filter */}
      <MembersFilter
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
      />

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tổng số thành viên: {filteredMembers.length}
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
                    {member.weapon}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Badge className={getColorForBadge(member.role)}>
                    {member.role}
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
