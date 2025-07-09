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
  ResourceLanguage,
  ResourceAudience,
  ResourceNeighborhood,
  ResourceOther,
} from "../types/types";

import useDatabaseStore from "../contexts/DatabaseStore.ts";

const ResourceSearch = () => {
  const [displayData, setDisplaydata] = useState<Resource[]>([]);
  const [filterSet, setFilterSet] = useState<FilterSet>({
    resourceTypes: new Set<ResourceType>(),
    resourceAudiences: new Set<ResourceAudience>(),
    resourceLanguages: new Set<ResourceLanguage>(),
    resourceNeighborhoods: new Set<ResourceNeighborhood>(),
    resourceOthers: new Set<ResourceOther>(),
  });

  const database = useDatabaseStore((state) => state.database);
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
