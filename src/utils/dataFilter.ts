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

export function handleFilterUpdate(
  database: ResourceDatabase,
  filterSet: FilterSet,
  setDisplayData: React.Dispatch<SetStateAction<Resource[]>>
): void {
  const filteredDatabase = Object.fromEntries(
    Object.entries(database).filter(
      ([_, resource]) =>
        typeMatch(resource, filterSet.resourceTypes) &&
        audienceMatch(resource, filterSet.resourceAudiences) &&
        languageMatch(resource, filterSet.resourceLanguages)
    )
  );
  console.log("filt:", filteredDatabase);
  setDisplayData(Object.values(filteredDatabase));
}

/**
 *
 * @param resource
 * @param types
 */
function typeMatch(resource: Resource, types: Set<ResourceType>): boolean {
  console.log("hello", resource.name);
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

function isSubsetOf<T>(a: Set<T>, b: Set<T>): boolean {
  let flag = true;
  console.log(a, b);
  for (const item of a) {
    if (!b.has(item)) flag = false;
  }
  console.log("Flag: ", flag);
  return flag;
}
