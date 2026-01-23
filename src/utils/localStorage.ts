/**
 * Retrieve selected resources from local storage
 * @returns Set containing names of all selected resources
 */
export function loadSelectedResources(): Set<number> {
  try {
    const data = localStorage.getItem("selectedResources");
    const parsed = data ? JSON.parse(data) : null;
    if (!parsed) return new Set<number>();
    const nums = (parsed as any[])
      .map(Number)
      .filter(
        (n: number) => Number.isFinite(n) && Number.isInteger(n) && n > 0
      );
    // persist sanitized selection back to storage so we don't repeatedly load invalid values
    try {
      localStorage.setItem("selectedResources", JSON.stringify(nums));
    } catch {}
    return new Set<number>(nums);
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
    const normalized = [...set]
      .map(Number)
      .filter((n) => Number.isFinite(n) && Number.isInteger(n) && n > 0);
    localStorage.setItem("selectedResources", JSON.stringify(normalized));
  } catch {
    // Silent fail
  }
}
