import React, { useState, useMemo, type SetStateAction } from "react";

import { useDebouncedEffect } from "@react-hookz/web";
import useDatabaseStore from "../contexts/DatabaseStore";
import type { FilterSet, Resource } from "../types/types";

import { useShallow } from "zustand/react/shallow";
import Fuse from "fuse.js";

import styles from "../styles/SearchBar.module.css";

interface SearchBarProps {
  setFilterSet: React.Dispatch<SetStateAction<FilterSet>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ setFilterSet }) => {
  const [searchText, setSearchText] = useState<string>("");
  const list: Resource[] = useDatabaseStore(
    useShallow((state) => Object.values(state.database))
  );
  const options = {
    threshold: 0.3,
    includeScore: true,
    keys: ["name", "description", "address"],
  };

  const fuse = useMemo(() => new Fuse(list, options), [list]);

  useDebouncedEffect(
    () => {
      handleSearchUpdate();
    },
    [searchText],
    300
  );

  function handleSearchUpdate() {
    if (searchText === "") {
      setFilterSet((prev) => ({
        ...prev,
        searchBarMatches: new Set<string>(["PASS"]),
      }));
    } else {
      const results = fuse.search(searchText);
      setFilterSet((prev) => ({
        ...prev,
        searchBarMatches: new Set<string>(
          results.map((result) => result.item.name)
        ),
      }));
    }
  }

  return (
    <div className={styles.searchContainer}>
      <span className={styles.label}>Search</span>
      <input
        placeholder="Search resource name, description or address"
        onChange={(e) => setSearchText(e.target.value)}
        className={styles.bar}
      />
    </div>
  );
};

export default SearchBar;
