import type { ResourceDatabase } from "../types/types";

/**
 * Sorting function to take in a list of IDs and sort the IDs based on their
 * associated resource name.
 * @param resources Array of IDs to be sorted by their associated name
 */
export function sorted(ids: number[], db: ResourceDatabase): number[] {
  function resourceCompare(a: number, b: number): number {
    if (db[a].name[0].toLowerCase() < db[b].name[0].toLowerCase()) return -1;
    else if (db[a].name[0].toLowerCase() > db[b].name[0].toLowerCase())
      return 1;
    else return 0;
  }

  return ids.toSorted(resourceCompare);
}
