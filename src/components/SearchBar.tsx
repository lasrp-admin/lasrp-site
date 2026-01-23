import React, { useState, useMemo, type SetStateAction } from "react";

import { useDebouncedEffect } from "@react-hookz/web";
import useDatabaseStore from "../contexts/DatabaseStore";
import type { FilterSet, Resource } from "../types/types";

import { useShallow } from "zustand/react/shallow";
import Fuse from "fuse.js";

import styles from "../styles/SearchBar.module.css";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";
import ReactDOM from "react-dom";

interface SearchBarProps {
  setFilterSet: React.Dispatch<SetStateAction<FilterSet>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ setFilterSet }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const list: Resource[] = useDatabaseStore(
    useShallow((state) => Object.values(state.database))
  );
  const options = {
    threshold: 0.3,
    includeScore: true,
    keys: ["name", "description"],
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
      <div className={styles.headerRow}>
        <AiOutlineQuestionCircle
          className={styles.helpIcon}
          onClick={() => setShowHelp((prev) => !prev)}
          title="Help"
        />
        <span className={styles.label}>Search</span>
      </div>
      {showHelp &&
        ReactDOM.createPortal(
          <div className={styles.overlay}>
            <div className={styles.infoBox}>
              <IoMdClose
                onClick={() => setShowHelp(false)}
                className={styles.toggle}
                size={30}
              />
              <span className={styles.text}>
                Start typing a word or phrase to search our database! The search
                looks through both resource names and descriptions.
              </span>
            </div>
          </div>,
          document.body
        )}
      <input
        placeholder="Search resource name and description"
        onChange={(e) => setSearchText(e.target.value)}
        className={styles.bar}
      />
    </div>
  );
};

export default SearchBar;
