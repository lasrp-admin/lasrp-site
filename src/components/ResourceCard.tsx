import styles from "../styles/ResourceCard.module.css";
import type React from "react";
import IconList from "./IconList";
import useDatabaseStore from "../contexts/DatabaseStore";

interface ResourceCardType {
  id: number;
}

const ResourceCard: React.FC<ResourceCardType> = ({ id }) => {
  const database = useDatabaseStore((state) => state.database);
  const resource = database[id];
  if (!resource) {
    return (
      <div className={styles.cardContainer}>
        <div style={{ fontStyle: "italic", color: "#666" }}>
          Resource not found
        </div>
      </div>
    );
  }

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
        <IconList categories={Array.from(resource.type).join(", ")} />
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
