"use client";

export function getProgressStorageKey(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `vaexil.tv:recon-progress:${slug || "map"}`;
}

export function readProgressSnapshot(storageKey: string) {
  if (typeof window === "undefined") {
    return "[]";
  }

  try {
    return window.localStorage.getItem(storageKey) || "[]";
  } catch {
    return "[]";
  }
}

export function parseProgressSnapshot(snapshot: string) {
  try {
    const markerIds = JSON.parse(snapshot) as unknown;
    return new Set(
      Array.isArray(markerIds)
        ? markerIds.filter((id): id is string => typeof id === "string")
        : [],
    );
  } catch {
    return new Set<string>();
  }
}

export function writeProgressSnapshot(storageKey: string, markerIds: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(markerIds)));
    window.dispatchEvent(new Event("vaexil-recon-progress"));
  } catch {
    window.dispatchEvent(new Event("vaexil-recon-progress"));
  }
}

export function subscribeToProgressStorage(
  storageKey: string,
  onStoreChange: () => void,
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === storageKey) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener("vaexil-recon-progress", onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("vaexil-recon-progress", onStoreChange);
  };
}
