export type VerityShape = "C" | "S" | "T";
export type VerityShape3d = "CC" | "SS" | "TT" | "CS" | "CT" | "TS";
export type VeritySide = "left" | "middle" | "right";

export type VerityDissection = {
  side: VeritySide;
  shape: VerityShape;
};

export type VerityInstruction = {
  swap: [VerityDissection, VerityDissection];
  expectedState: VerityShape3d[];
};

export const veritySides: VeritySide[] = ["left", "middle", "right"];
export const verityShapes: VerityShape[] = ["C", "S", "T"];
export const verityShapes3d: VerityShape3d[] = ["CC", "SS", "TT", "CS", "CT", "TS"];

export const verityShapeLabels: Record<VerityShape, string> = {
  C: "Circle",
  S: "Square",
  T: "Triangle",
};

export const verityShape3dLabels: Record<VerityShape3d, string> = {
  CC: "Sphere",
  SS: "Cube",
  TT: "Tetrahedron",
  CS: "Cylinder",
  CT: "Cone",
  TS: "Triangular Prism",
};

const shape3dComponents: Record<VerityShape3d, [VerityShape, VerityShape]> = {
  CC: ["C", "C"],
  SS: ["S", "S"],
  TT: ["T", "T"],
  CS: ["C", "S"],
  CT: ["C", "T"],
  TS: ["T", "S"],
};

const doubleShapes = new Set<VerityShape3d>(["CC", "SS", "TT"]);

function removeFirst<T>(items: T[], item: T) {
  const index = items.indexOf(item);
  if (index >= 0) {
    items.splice(index, 1);
  }
  return items;
}

function findShape3d(components: [VerityShape, VerityShape]): VerityShape3d {
  const found = Object.entries(shape3dComponents).find(([, candidate]) => {
    const remaining = [...candidate];
    removeFirst(remaining, components[0]);
    removeFirst(remaining, components[1]);
    return remaining.length === 0;
  });

  if (!found) {
    throw new Error(`No Verity 3D shape exists for ${components.join(",")}.`);
  }

  return found[0] as VerityShape3d;
}

function updateShape3d(
  currentShape: VerityShape3d,
  add: VerityShape,
  subtract: VerityShape,
) {
  const components = [...shape3dComponents[currentShape]];
  removeFirst(components, subtract);
  components.push(add);
  return findShape3d(components as [VerityShape, VerityShape]);
}

function applySwap(
  swap: [VerityDissection, VerityDissection],
  outsideState: VerityShape3d[],
) {
  const nextState = [...outsideState];
  const firstIndex = veritySides.indexOf(swap[0].side);
  const secondIndex = veritySides.indexOf(swap[1].side);

  nextState[firstIndex] = updateShape3d(nextState[firstIndex], swap[1].shape, swap[0].shape);
  nextState[secondIndex] = updateShape3d(nextState[secondIndex], swap[0].shape, swap[1].shape);

  return nextState;
}

function findNextSwap(inside: VerityShape[], outside: VerityShape3d[]) {
  const candidates: VerityDissection[] = [];
  const sidesMoved = new Set<VeritySide>();

  outside.forEach((shape3d, index) => {
    const side = veritySides[index];
    const personalShape = inside[index];
    if (doubleShapes.has(shape3d) && shape3d.includes(personalShape)) {
      candidates.push({ side, shape: shape3dComponents[shape3d][0] });
      sidesMoved.add(side);
    }
  });

  outside.forEach((shape3d, index) => {
    const side = veritySides[index];
    if (doubleShapes.has(shape3d)) {
      candidates.push({ side, shape: shape3dComponents[shape3d][0] });
      sidesMoved.add(side);
    }
  });

  outside.forEach((shape3d, index) => {
    const side = veritySides[index];
    const personalShape = inside[index];
    if (shape3dComponents[shape3d].includes(personalShape) && !sidesMoved.has(side)) {
      candidates.push({ side, shape: personalShape });
      sidesMoved.add(side);
    }
  });

  const first = candidates[0];
  if (!first) {
    return null;
  }

  const second = candidates.find(
    (candidate) => candidate.side !== first.side && candidate.shape !== first.shape,
  );

  return second ? [first, second] as [VerityDissection, VerityDissection] : null;
}

export function validateVerityState(inside: VerityShape[], outside: VerityShape3d[]) {
  if (new Set(inside).size !== 3) {
    return "Inside statues must contain one circle, one square, and one triangle.";
  }

  const counts = outside.flatMap((shape) => shape3dComponents[shape]).reduce(
    (acc, shape) => ({ ...acc, [shape]: acc[shape] + 1 }),
    { C: 0, S: 0, T: 0 } satisfies Record<VerityShape, number>,
  );

  if (!verityShapes.every((shape) => counts[shape] === 2)) {
    return "Outside shapes must contain exactly two circles, two squares, and two triangles total.";
  }

  return "";
}

export function solveVerityDissection(inside: VerityShape[], outside: VerityShape3d[]) {
  if (validateVerityState(inside, outside)) {
    return [];
  }

  const instructions: VerityInstruction[] = [];
  let outsideState = [...outside];

  for (let index = 0; index < 10; index += 1) {
    const swap = findNextSwap(inside, outsideState);
    if (!swap) {
      break;
    }

    outsideState = applySwap(swap, outsideState);
    instructions.push({ swap, expectedState: outsideState });
  }

  return instructions;
}

