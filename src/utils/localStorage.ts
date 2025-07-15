export function loadSelectedResources(): Set<string> {
  try {
    const data = localStorage.getItem("selectedResources");
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveSelectedResources(set: Set<string>) {
  try {
    localStorage.setItem("selectedResources", JSON.stringify([...set]));
  } catch {
    // Silent fail
  }
}
