import { IoMdClose } from "react-icons/io";
import { useDatabaseContext } from "../contexts/DatabaseContext";

import styles from "../styles/SelectedResourcesView.module.css";
import type React from "react";
import type { SetStateAction } from "react";

interface SelectedResourceViewProps {
  setFavorite: React.Dispatch<SetStateAction<boolean>>;
}

const SelectedResourcesView: React.FC<SelectedResourceViewProps> = ({
  setFavorite,
}) => {
  const { database, selectedResources } = useDatabaseContext();
  return (
    <div className={styles.overlay}>
      <div className={styles.mainBox}>
        <IoMdClose
          onClick={() => setFavorite(false)}
          className={styles.toggle}
          size={30}
        />
        {selectedResources.size > 0 ? (
          Array.from(selectedResources).map((name) => (
            <div>
              <span>{name}</span>
              <span>{database[name].description}</span>
            </div>
          ))
        ) : (
          <span>No selected resources.</span>
        )}
      </div>
    </div>
  );
};

export default SelectedResourcesView;
