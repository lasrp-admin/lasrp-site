/**
 * Retrieve selected resources from local storage
 * @returns Set containing names of all selected resources
 */
export function loadSelectedResources(): Set<string> {
  try {
    const data = localStorage.getItem("selectedResources");
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Save selected resources to local storage
 * @param set Set containing names of all selected resources to be saved
 */
export function saveSelectedResources(set: Set<string>) {
  try {
    localStorage.setItem("selectedResources", JSON.stringify([...set]));
  } catch {
    // Silent fail
  }
}
