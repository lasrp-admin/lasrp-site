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
import Acknowledgements from "./Acknowledgements";
import AboutUs from "./AboutUs";

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
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 1500);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const database = useDatabaseStore((state) => state.database);

  useEffect(() => {
    setDisplaydata(sorted(Object.keys(database).map(Number), database));
  }, [database]);

  useEffect(() => {
    handleFilterUpdate(database, filterSet, setDisplaydata);
  }, [filterSet]);

  return (
    <div className={styles.mainContainer}>
      {isMobile ? (
        <>
          <button
            className={styles.menuButton}
            onClick={() => setShowMenu((prev) => !prev)}
          >
            {showMenu ? "Close filters" : "Open filters"}
          </button>
          {showMenu && (
            <div className={styles.leftPanel}>
              <SearchBar setFilterSet={setFilterSet} />
              <Filters setFilterSet={setFilterSet} />
              <Contact />
            </div>
          )}
        </>
      ) : (
        <div className={styles.leftPanel}>
          <SearchBar setFilterSet={setFilterSet} />
          <Filters setFilterSet={setFilterSet} />
          <Contact />
          <Acknowledgements />
          <AboutUs />
        </div>
      )}

      <div className={styles.results}>
        <Results ids={displayData} />
      </div>
    </div>
  );
};

export default ResourceSearch;
