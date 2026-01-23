import { IoMdClose } from "react-icons/io";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

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
  const database = useDatabaseStore((state) => state.database);
  const portalEl = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const el = document.createElement("div");
    portalEl.current = el;
    document.body.appendChild(el);
    // set a small state so component re-renders and createPortal can run
    setReady(true);
    return () => {
      if (portalEl.current) {
        document.body.removeChild(portalEl.current);
        portalEl.current = null;
      }
      setReady(false);
    };
  }, []);

  const content = (
    <div className={styles.overlay}>
      <div className={styles.mainBox}>
        <div className={styles.gridContainer}>
          {selectedResources.size > 0 ? (
            (() => {
              const ids = Array.from(selectedResources).map(Number);
              const valid = ids.filter((id) => database && database[id]);
              const missing = ids.length - valid.length;
              if (valid.length > 0) {
                return valid.map((id) => <ResourceCard id={id} key={id} />);
              }
              return (
                <div>
                  <div>No selected resources available.</div>
                  {missing > 0 && (
                    <div style={{ marginTop: 8, color: "#666" }}>
                      {missing} selected item(s) not found (may be outdated).
                    </div>
                  )}
                </div>
              );
            })()
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

  return ready && portalEl.current
    ? createPortal(content, portalEl.current)
    : null;
};

export default SelectedResourcesView;
