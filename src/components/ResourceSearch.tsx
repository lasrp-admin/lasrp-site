import { useState, useEffect } from "react";

import { handleFilterUpdate } from "../utils/dataFilter.ts";
import { sorted } from "../utils/sorted.ts";
import Filters from "./Filters";
import Results from "./Results";

import styles from "../styles/ResourceSearch.module.css";

import type {
  FilterSet,
  ResourceType,
  ResourceLanguage,
  ResourceAudience,
  ResourceNeighborhood,
  ResourceOther,
} from "../types/types";

import useDatabaseStore from "../contexts/DatabaseStore.ts";
import SearchBar from "./SearchBar.tsx";
import Contact from "./Contact.tsx";

const ResourceSearch = () => {
  const [displayData, setDisplaydata] = useState<number[]>([]);
  const [filterSet, setFilterSet] = useState<FilterSet>({
    searchBarMatches: new Set<string>(),
    resourceTypes: new Set<ResourceType>(),
    resourceAudiences: new Set<ResourceAudience>(),
    resourceLanguages: new Set<ResourceLanguage>(),
    resourceNeighborhoods: new Set<ResourceNeighborhood>(),
    resourceOthers: new Set<ResourceOther>(),
  });

  const database = useDatabaseStore((state) => state.database);

  useEffect(() => {
    setDisplaydata(sorted(Object.keys(database).map(Number), database));
  }, [database]);

  useEffect(() => {
    handleFilterUpdate(database, filterSet, setDisplaydata);
  }, [filterSet]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.leftPanel}>
        <SearchBar setFilterSet={setFilterSet} />
        <Filters setFilterSet={setFilterSet} />
        <Contact />
        <div className={styles.tag}>
          <a
            href="https://github.com/AtonalDev/lasrp"
            target="_blank"
            style={{ color: "#007AFF" }}
          >
            Code{" "}
          </a>
          by
          <a
            href="https://github.com/AtonalDev"
            target="_blank"
            style={{ color: "#007AFF" }}
          >
            {" "}
            Atonal
          </a>
        </div>
      </div>
      <Results ids={displayData} />
    </div>
  );
};

export default ResourceSearch;
