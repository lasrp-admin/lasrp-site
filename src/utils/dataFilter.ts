import type React from "react";
import type { FilterSet, Resource, ResourceDatabase } from "../types/types";
import type { SetStateAction } from "react";

import { sorted } from "../utils/sorted";

export function handleFilterUpdate(
  database: ResourceDatabase,
  filterSet: FilterSet,
  setDisplayData: React.Dispatch<SetStateAction<Resource[]>>
): void {
  const filteredDatabase = Object.fromEntries(
    Object.entries(database).filter(
      ([_, resource]) =>
        resource.selected ||
        (isSubsetOf(filterSet.resourceTypes, resource.type) &&
          isSubsetOf(filterSet.resourceAudiences, resource.audience) &&
          isSubsetOf(filterSet.resourceLanguages, resource.language) &&
          isSubsetOf(filterSet.resourceNeighborhoods, resource.neighborhood) &&
          isSubsetOf(filterSet.resourceOthers, resource.other))
    )
  );
  setDisplayData(sorted(Object.values(filteredDatabase)));
}

export function isSubsetOf<T>(a: Set<T>, b: Set<T>): boolean {
  let flag = true;
  for (const item of a) {
    if (!b.has(item)) flag = false;
  }
  return flag;
}
