import { IoMdClose } from "react-icons/io";

import useDatabaseStore from "../contexts/DatabaseStore";
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
  const selectedResources = useDatabaseStore(
    (state) => state.selectedResources
  );
  return (
    <div className={styles.overlay}>
      <div className={styles.mainBox}>
        <div className={styles.gridContainer}>
          {Object.keys(selectedResources).length > 0 ? (
            Array.from(Object.keys(selectedResources)).map((name) => (
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
