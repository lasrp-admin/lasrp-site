/**
 * Retrieve selected resources from local storage
 * @returns Set containing names of all selected resources
 */
export function loadSelectedResources(): Set<number> {
  try {
    const data = localStorage.getItem("selectedResources");
    const parsed = data ? JSON.parse(data) : null;
    return parsed ? new Set<number>(parsed.map(Number)) : new Set<number>();
  } catch {
    return new Set();
  }
}

/**
 * Save selected resources to local storage
 * @param set Set containing names of all selected resources to be saved
 */
export function saveSelectedResources(set: Set<number>) {
  try {
    localStorage.setItem("selectedResources", JSON.stringify([...set]));
  } catch {
    // Silent fail
  }
}
