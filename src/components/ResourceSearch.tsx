import { useState, useEffect } from "react";

import { handleFilterUpdate } from "../utils/dataFilter.ts";
import { sorted } from "../utils/sorted.ts";
import Filters from "./Filters";
import Results from "./Results";

import styles from "../styles/ResourceSearch.module.css";

import type {
  FilterSet,
  Resource,
  ResourceType,
  LanguageType,
  AudienceType,
} from "../types/types";
import { useDatabaseContext } from "../contexts/DatabaseContext.tsx";

const ResourceSearch = () => {
  const [displayData, setDisplaydata] = useState<Resource[]>([]);
  const [filterSet, setFilterSet] = useState<FilterSet>({
    resourceTypes: new Set<ResourceType>(),
    resourceAudiences: new Set<AudienceType>(),
    resourceLanguages: new Set<LanguageType>(),
  });

  const { database } = useDatabaseContext();
  useEffect(() => {
    setDisplaydata(sorted(Object.entries(database).map((entry) => entry[1])));
  }, [database]);

  useEffect(() => {
    handleFilterUpdate(database, filterSet, setDisplaydata);
  }, [filterSet]);

  return (
    <div className={styles.mainContainer}>
      <Filters setFilterSet={setFilterSet} />
      <Results data={displayData} />
    </div>
  );
};

export default ResourceSearch;
