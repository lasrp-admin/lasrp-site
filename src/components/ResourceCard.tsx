import { useDatabaseContext } from "../contexts/DatabaseContext";
import styles from "../styles/ResourceCard.module.css";
import type React from "react";
import IconList from "./IconList";

interface ResourceCardType {
  name: string;
}

const ResourceCard: React.FC<ResourceCardType> = ({ name }) => {
  const { database } = useDatabaseContext();
  const resource = database[name];

  return (
    <div className={styles.cardContainer}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <span style={{ fontWeight: "bold" }}>{resource.name}</span>
        <IconList categories={Array.from(resource.type)} />
      </div>
      <span>{resource.description}</span>
      {(resource.eligibility || resource.eligibilityText) && (
        <div className={styles.detail}>
          {resource.eligibility && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              {resource.eligibility.map((x) => (
                <span key={x} style={{ fontWeight: "bold" }}>
                  {x}
                </span>
              ))}
              {resource.eligibilityText && (
                <span>{resource.eligibilityText}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceCard;
