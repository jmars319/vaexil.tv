const truthyValues = new Set(["1", "true", "yes", "on"]);

export const destinyGuidesPublicEnvKey = "DESTINY_GUIDES_PUBLIC";

export function destinyGuidesArePublic() {
  const value = process.env[destinyGuidesPublicEnvKey]?.trim().toLowerCase();

  return value ? truthyValues.has(value) : false;
}

export function destinyGuideRobots() {
  return destinyGuidesArePublic()
    ? undefined
    : {
        index: false,
        follow: false,
      };
}
