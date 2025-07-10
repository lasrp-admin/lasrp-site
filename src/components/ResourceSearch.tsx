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
      <div className={styles.leftPanel}>
        <Filters setFilterSet={setFilterSet} />
        <div className={styles.textBox}>
          <span className={styles.text}>
            Welcome to LASRP! We hope that our database will help make it easier
            for providers and patients to quickly find appropriate resources in
            the LA area.
          </span>
          <span className={styles.text}>
            To use our search tool, simply add as many filters as you want using
            the drop down menus. We currently support filtering on the resource
            type, intended audience, supported languages and neighborhood of the
            resource, along with a few miscellaneous categories.
          </span>
          <span className={styles.text}>
            You can select resources by clicking on the empty square the left of
            the names. Selected resources can be viewed by clicking the star at
            the top right of the page, and can be printed out by clicking the
            printer icon.
          </span>
        </div>
        {/* <div className={styles.tag}>
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
        </div>*/}
      </div>
      <Results data={displayData} />
    </div>
  );
};

export default ResourceSearch;
