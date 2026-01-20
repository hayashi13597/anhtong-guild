import { BadgeColor, Region, Role } from "@/types";

export const getColorForBadge = (badgeColor: BadgeColor | Role | Region) => {
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
