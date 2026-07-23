export type ArmorSetToggleRequirement = {
  setHash: number;
  count: 2 | 4;
};

export function toggleArmorSetRequirement(
  current: ArmorSetToggleRequirement[],
  target: ArmorSetToggleRequirement,
) {
  const isAlreadySelected = current.some(
    (requirement) =>
      requirement.setHash === target.setHash &&
      requirement.count === target.count,
  );
  if (isAlreadySelected) {
    return current.filter(
      (requirement) =>
        requirement.setHash !== target.setHash ||
        requirement.count !== target.count,
    );
  }

  if (target.count === 4) {
    return [target];
  }

  const twoPieceRequirements = current.filter(
    (requirement) =>
      requirement.count === 2 && requirement.setHash !== target.setHash,
  );
  return [...twoPieceRequirements.slice(-1), target];
}
