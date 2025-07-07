import { IoMdClose } from "react-icons/io";
import { useDatabaseContext } from "../contexts/DatabaseContext";

import styles from "../styles/SelectedResourcesView.module.css";
import type React from "react";
import type { SetStateAction } from "react";
import ResourceCard from "./ResourceCard";

interface SelectedResourceViewProps {
  setFavorite: React.Dispatch<SetStateAction<boolean>>;
}

const SelectedResourcesView: React.FC<SelectedResourceViewProps> = ({
  setFavorite,
}) => {
  const { selectedResources } = useDatabaseContext();
  return (
    <div className={styles.overlay}>
      <div className={styles.mainBox}>
        <div className={styles.gridContainer}>
          {selectedResources.size > 0 ? (
            Array.from(selectedResources).map((name) => (
              <ResourceCard name={name} />
            ))
          ) : (
            <span>No selected resources.</span>
          )}
        </div>
        <div className={styles.toggle}>
          <IoMdClose onClick={() => setFavorite(false)} size={30} />
        </div>
      </div>
    </div>
  );
};

export default SelectedResourcesView;
