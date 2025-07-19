import type React from "react";
import type { FilterSet, ResourceDatabase } from "../types/types";
import type { SetStateAction } from "react";

import { sorted } from "../utils/sorted";

/**
 * Triggered when filter criteria are updated, sets the data that should be
 * displayed to the displayData state.
 * @param database Resource database to be filtered
 * @param filterSet FilterSet type containing filtering constraints
 * @param setDisplayData React state setter to update data based on filters
 */
export function handleFilterUpdate(
  database: ResourceDatabase,
  filterSet: FilterSet,
  setDisplayData: React.Dispatch<SetStateAction<number[]>>
): void {
  const filteredDatabase = Object.fromEntries(
    Object.entries(database).filter(
      ([_, resource]) =>
        (filterSet.searchBarMatches.has(resource.name) ||
          filterSet.searchBarMatches.has("PASS")) &&
        isSubsetOf(filterSet.resourceTypes, resource.type) &&
        isSubsetOf(filterSet.resourceAudiences, resource.audience) &&
        isSubsetOf(filterSet.resourceLanguages, resource.language) &&
        isSubsetOf(filterSet.resourceNeighborhoods, resource.neighborhood) &&
        isSubsetOf(filterSet.resourceOthers, resource.other)
    )
  );
  setDisplayData(
    sorted(
      Object.values(filteredDatabase).map((resource) => resource.id),
      database
    )
  );
}

/**
 * Check if a set is a subset of another set.
 * @param a
 * @param b
 * @returns True if a is a subset of b else false
 */
export function isSubsetOf<T>(a: Set<T>, b: Set<T>): boolean {
  let flag = true;
  for (const item of a) {
    if (!b.has(item)) flag = false;
  }
  return flag;
}
