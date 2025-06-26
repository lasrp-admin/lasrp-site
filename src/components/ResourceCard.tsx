import type { Resource } from "../types/types";

import styles from "../styles/ResourceCard.module.css";
import React from "react";

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <div className={styles.cardContainer}>
      <span className={styles.title}>{resource.name}</span>
    </div>
  );
};

export default ResourceCard;
