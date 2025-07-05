import styles from "../styles/ResourceRow.module.css";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { IoMdExpand } from "react-icons/io";
import { AiOutlineCompress } from "react-icons/ai";
import { GoGlobe } from "react-icons/go";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { MdCheckBox } from "react-icons/md";
import { useDatabaseContext } from "../contexts/DatabaseContext";

interface ResourceRowProps {
  name: string;
  description: string;
  website: string;
  expandInit: boolean;
  selected: boolean;
  color: 0 | 1;
}

const ResourceRow: React.FC<ResourceRowProps> = React.memo(
  ({ name, description, website, color, expandInit, selected }) => {
    const [expand, setExpand] = useState<boolean>(expandInit);
    const [linkHover, setLinkHover] = useState<boolean>(false);
    const { setSelectedResources } = useDatabaseContext();

    console.log("Rendering");
    return (
      <motion.div
        className={styles.rowContainer}
        style={{ backgroundColor: color === 0 ? "#bfbfbf" : "#e3e3e3" }}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ opacity: { duration: 0.2 } }}
      >
        <span className={styles.title}>{name}</span>
        <div className={styles.checkbox}>
          {selected ? (
            <MdCheckBox
              size={20}
              onClick={() => {
                console.log("click");
                setSelectedResources((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(name);
                  return newSet;
                });
              }}
            />
          ) : (
            <MdCheckBoxOutlineBlank
              size={20}
              onClick={() => {
                console.log("click");
                setSelectedResources((prev) => {
                  const newSet = new Set(prev);
                  newSet.add(name);
                  return newSet;
                });
              }}
            />
          )}
        </div>
        <div className={styles.iconRow}>
          <GoGlobe
            onClick={() => window.open(website, "_blank")}
            onMouseEnter={() => setLinkHover((prev) => !prev)}
            onMouseLeave={() => setLinkHover((prev) => !prev)}
            className={styles.icon}
            style={{ color: linkHover ? "#007AFF" : "black" }}
            size={20}
          />
          {expand ? (
            <AiOutlineCompress
              onClick={() => setExpand((prev) => !prev)}
              className={styles.icon}
              size={22}
            />
          ) : (
            <IoMdExpand
              onClick={() => setExpand((prev) => !prev)}
              className={styles.icon}
              size={22}
            />
          )}
        </div>
        <AnimatePresence>
          {expand && (
            <motion.div
              className={styles.details}
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.spacer}></div>
              <span>{description}</span>
              <p>
                <strong>Link:</strong>{" "}
                <a href={website} target="_blank" rel="noopener noreferrer">
                  {website}
                </a>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

export default ResourceRow;
