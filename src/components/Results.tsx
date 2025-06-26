import React, { useState } from "react";
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
        {data.length > 0
          ? `${data.length} resources found.`
          : "No resources matching your filters were found."}
      </span>
      <div className={styles.table}>
        {data.length > 0 &&
          data.map((entry, i) => (
            <ResourceRow key={i} resource={entry} color={(i % 2) as 0 | 1} />
          ))}
      </div>
    </div>
  );
};

export default Results;
