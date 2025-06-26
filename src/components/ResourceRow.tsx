import type { Resource } from "../types/types";

import styles from "../styles/ResourceRow.module.css";
import React, { useState } from "react";

import { IoMdExpand } from "react-icons/io";
import { AiOutlineCompress } from "react-icons/ai";

interface ResourceRowProps {
  resource: Resource;
  color: 0 | 1;
}

const ResourceRow: React.FC<ResourceRowProps> = ({ resource, color }) => {
  const [expand, setExpand] = useState<boolean>(false);

  return (
    <div
      className={styles.rowContainer}
      style={{ backgroundColor: color === 0 ? "#bfbfbf" : "#e3e3e3" }}
    >
      <span className={styles.title}>{resource.name}</span>
      {expand ? (
        <AiOutlineCompress
          className={styles.toggle}
          onClick={() => setExpand((prev) => !prev)}
        />
      ) : (
        <IoMdExpand
          className={styles.toggle}
          onClick={() => setExpand((prev) => !prev)}
        />
      )}
    </div>
  );
};

export default ResourceRow;
