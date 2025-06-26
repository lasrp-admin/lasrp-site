import { useState, useEffect } from "react";

import { handleFilterUpdate } from "../utils/dataFilter.ts";
import Filters from "./Filters";
import Results from "./Results";

import type {
  ResourceDatabase,
  FilterSet,
  Resource,
  ResourceType,
  LanguageType,
  AudienceType,
} from "../types/types";

const ResourceSearch = () => {
  const [database, setDatabase] = useState<ResourceDatabase>({});
  const [displayData, setDisplaydata] = useState<Resource[]>([]);
  const [filterSet, setFilterSet] = useState<FilterSet>({
    resourceTypes: new Set<ResourceType>(),
    resourceAudiences: new Set<AudienceType>(),
    resourceLanguages: new Set<LanguageType>(),
  });

  useEffect(() => {
    const fetchJSON = async () => {
      try {
        const response = await fetch("/data/data.json");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json: ResourceDatabase = await response.json();
        const convertLists: ResourceDatabase = Object.fromEntries(
          Object.entries(json).map(([key, resource]) => [
            key,
            {
              ...resource,
              type: new Set(resource.type),
              audience: new Set(resource.audience),
              language: new Set(resource.language),
              other: new Set(resource.other),
            },
          ])
        );

        setDatabase(convertLists);
        setDisplaydata(Object.entries(convertLists).map((entry) => entry[1]));
      } catch (err) {
        console.error("Failed to load JSON: ", err);
      }
    };
    fetchJSON();
  }, []);

  useEffect(() => {
    handleFilterUpdate(database, filterSet, setDisplaydata);
  }, [filterSet]);

  return (
    <div>
      <Filters setFilterSet={setFilterSet} />
      <Results data={displayData} />
    </div>
  );
};

export default ResourceSearch;
