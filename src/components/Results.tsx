import React from "react";
import { AnimatePresence, motion } from "motion/react";

import type { Resource } from "../types/types";
import ResourceRow from "./ResourceRow";

import styles from "../styles/Results.module.css";

interface ResultsProps {
  data: Resource[];
}

const Results: React.FC<ResultsProps> = ({ data }) => {
  return (
    <div className={styles.resultsContainer}>
      <span className={styles.message}>
        {data.length > 0 ? (
          `${data.length} resources found.`
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>No resources matching your filters were found.</span>
            <span>
              If you represent a resource or know of one that is missing in our
              database, please reach out to [email] so that we can look into
              adding it.
            </span>
          </div>
        )}
      </span>
      <motion.div className={styles.table} layout>
        <AnimatePresence>
          {data.length > 0 &&
            data.map((entry, i) => (
              <ResourceRow key={i} resource={entry} color={(i % 2) as 0 | 1} />
            ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Results;
