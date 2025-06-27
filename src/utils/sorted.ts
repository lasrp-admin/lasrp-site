import type { Resource } from "../types/types";

/**
 * Sorting function to get an array of type Resource[] sorted by resource.name
 * @param resources Array of Resource objects to be sorted by the name property
 */
export function sorted(resources: Resource[]): Resource[] {
  function resourceCompare(a: Resource, b: Resource): number {
    if (a.name < b.name) return -1;
    else if (a.name > b.name) return 1;
    else return 0;
  }

  return resources.toSorted(resourceCompare);
}
