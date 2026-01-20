type BadgeColor = "blue" | "green" | "yellow" | "red";
type Role = "DPS" | "Healer" | "Tank";
type Region = "NA" | "EU" | "VN";
type RoleFilter = Role | "all";
type RegionFilter = Region | "all";
type FilterState = {
  name: string;
  id: string;
  role: RoleFilter;
  region: RegionFilter;
};

type Member = {
  id: string;
  name: string;
  weapon: string;
  role: Role;
  region: Region;
};

export type {
  BadgeColor,
  FilterState,
  Member,
  Region,
  RegionFilter,
  Role,
  RoleFilter
};
