export const classEnum = [
  "strategicSword",
  "heavenquakerSpear",
  "namelessSword",
  "namelessSpear",
  "vernalUmbrella",
  "inkwellFan",
  "soulshadeUmbrella",
  "panaceaFan",
  "thundercryBlade",
  "stormreakerSpear",
  "infernalTwinblades",
  "mortalRopeDart"
] as const;

export type ClassType = (typeof classEnum)[number];

// Mapping from class enum to display names
export const classDisplayNames: Record<ClassType, string> = {
  strategicSword: "Cửu kiếm",
  heavenquakerSpear: "Cửu thương",
  namelessSword: "Vô Danh Kiếm",
  namelessSpear: "Vô Danh Thương",
  vernalUmbrella: "Dù DPS",
  inkwellFan: "Quạt DPS",
  soulshadeUmbrella: "Dù Heal",
  panaceaFan: "Quạt Heal",
  thundercryBlade: "Đại đao",
  stormreakerSpear: "Thương Tank",
  infernalTwinblades: "Song Đao",
  mortalRopeDart: "Roi"
};

// Utility function to format class array for display
export function formatClasses(classes: [ClassType, ClassType]): string {
  return classes.map(cls => classDisplayNames[cls]).join(" / ");
}
