import React from "react";
import { AnimatePresence, motion } from "motion/react";

import ResourceRow from "./ResourceRow";

import styles from "../styles/Results.module.css";

import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import useDatabaseStore from "../contexts/DatabaseStore";
import { FiPrinter } from "react-icons/fi";
import { FaRegStar } from "react-icons/fa6";

interface ResultsProps {
  ids: number[];
}

const Results: React.FC<ResultsProps> = ({ ids }) => {
  const database = useDatabaseStore((state) => state.database);
  const addFavoriteResources = useDatabaseStore(
    (state) => state.addFavoriteResources
  );
  const allSelected = useDatabaseStore((state) => state.areAllSelected(ids));
  const selectAll = useDatabaseStore((state) => state.selectAll);
  const deselectAll = useDatabaseStore((state) => state.deselectAll);
  const areAnySelected = useDatabaseStore((state) => state.areAnySelected());

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.tableHeader}>
        {ids.length > 0 ? (
          <>
            {allSelected ? (
              <div className={styles.checkBox}>
                <MdCheckBox
                  size={25}
                  onClick={() => deselectAll(ids)}
                  style={{ cursor: "pointer" }}
                />
                <span>Deselect All</span>
              </div>
            ) : (
              <div className={styles.checkBox}>
                <MdCheckBoxOutlineBlank
                  size={25}
                  onClick={() => selectAll(ids)}
                  style={{ cursor: "pointer" }}
                />
                <span>Select All</span>
              </div>
            )}
            <span className={styles.count}>{ids.length} resources found.</span>
            <div className={styles.selectedOptions}>
              <FaRegStar
                size={30}
                title={"Add selected resources to favorites"}
                style={{
                  cursor: areAnySelected ? "pointer" : "not-allowed",
                  color: areAnySelected ? "black" : "lightgray",
                }}
                onClick={() => addFavoriteResources()}
              />
              <FiPrinter
                size={30}
                title={"Print selected resources"}
                style={{
                  cursor: areAnySelected ? "pointer" : "not-allowed",
                  color: areAnySelected ? "black" : "lightgray",
                }}
              />
            </div>
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              width: "40vw",
              marginTop: "10vh",
              display: "flex",
              flexDirection: "column",
              gap: "25px",
            }}
          >
            <span>No resources matching your filters were found.</span>
            <span>
              If you represent a resource or know of one that is missing in our
              database, please reach out to
            </span>
            <span style={{ fontWeight: "bold" }}>
              contact[dot]lasrp[at]gmail[dot]com
            </span>
            <span>so that we can look into adding it.</span>
          </div>
        )}
      </div>
      <motion.div className={styles.table} layout>
        <AnimatePresence>
          {ids.length > 0 &&
            ids.map((id, i) => {
              const entry = database[id];
              console.log("Entry: ", id, entry);
              return (
                <ResourceRow
                  key={entry.name}
                  name={entry.name}
                  id={entry.id}
                  description={entry.description}
                  categories={Array.from(entry.type).join(", ")}
                  eligibility={entry.eligibility}
                  eligibilityText={entry.eligibilityText}
                  website={entry.website}
                  phone={entry.phone}
                  email={entry.email}
                  address={entry.address}
                  color={(i % 2) as 0 | 1}
                  expandInit={false}
                />
              );
            })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Results;
