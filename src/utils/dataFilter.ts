import type React from "react";
import type {
  FilterSet,
  Resource,
  ResourceDatabase,
  ResourceType,
  LanguageType,
  AudienceType,
} from "../types/types";
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
        (typeMatch(resource, filterSet.resourceTypes) &&
          audienceMatch(resource, filterSet.resourceAudiences) &&
          languageMatch(resource, filterSet.resourceLanguages))
    )
  );
  setDisplayData(sorted(Object.values(filteredDatabase)));
}

/**
 *
 * @param resource
 * @param types
 */
function typeMatch(resource: Resource, types: Set<ResourceType>): boolean {
  return isSubsetOf(types, resource.type);
}

/**
 *
 * @param resource
 * @param types
 */
function audienceMatch(
  resource: Resource,
  audiences: Set<AudienceType>
): boolean {
  return isSubsetOf(audiences, resource.audience);
}

/**
 *
 * @param resource
 * @param types
 */
function languageMatch(
  resource: Resource,
  languages: Set<LanguageType>
): boolean {
  return isSubsetOf(languages, resource.language);
}

export function isSubsetOf<T>(a: Set<T>, b: Set<T>): boolean {
  let flag = true;
  for (const item of a) {
    if (!b.has(item)) flag = false;
  }
  return flag;
}
