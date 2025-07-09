import React from "react";
import { AnimatePresence, motion } from "motion/react";

import type { Resource } from "../types/types";
import ResourceRow from "./ResourceRow";

import styles from "../styles/Results.module.css";

import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import useDatabaseStore from "../contexts/DatabaseStore";

interface ResultsProps {
  data: Resource[];
}

const Results: React.FC<ResultsProps> = ({ data }) => {
  const allSelected = useDatabaseStore((state) => state.areAllSelected(data));
  const selectAll = useDatabaseStore((state) => state.selectAll);
  const deselectAll = useDatabaseStore((state) => state.deselectAll);

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.tableHeader}>
        {data.length > 0 ? (
          <>
            {allSelected ? (
              <div className={styles.checkBox}>
                <MdCheckBox
                  size={25}
                  onClick={() => deselectAll(data)}
                  style={{ cursor: "pointer" }}
                />
                <span>Deselect All</span>
              </div>
            ) : (
              <div className={styles.checkBox}>
                <MdCheckBoxOutlineBlank
                  size={25}
                  onClick={() => selectAll(data)}
                  style={{ cursor: "pointer" }}
                />
                <span>Select All</span>
              </div>
            )}
            <span className={styles.count}>{data.length} resources found.</span>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <span>
              No resources matching your filters were found. If you represent a
              resource or know of one that is missing in our database, please
              reach out to contact[dot]lasrp[at]gmail[dot]com so that we can
              look into adding it.
            </span>
          </div>
        )}
      </div>
      <motion.div className={styles.table} layout>
        <AnimatePresence>
          {data.length > 0 &&
            data.map((entry, i) => {
              return (
                <ResourceRow
                  key={entry.name}
                  name={entry.name}
                  description={entry.description}
                  categories={Array.from(entry.type).join(", ")}
                  eligibility={entry.eligibility}
                  eligibilityText={entry.eligibilityText}
                  website={entry.website}
                  phone1={entry.phone1}
                  mail1={entry.email1}
                  mail2={entry.email2}
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
