import styles from "../styles/ResourceRow.module.css";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { IoMdExpand } from "react-icons/io";
import { AiOutlineCompress } from "react-icons/ai";
import { GoGlobe } from "react-icons/go";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { MdCheckBox } from "react-icons/md";
import { FaPhoneFlip } from "react-icons/fa6";
import { IoMdPin } from "react-icons/io";
import { MdEmail } from "react-icons/md";

import IconList from "./IconList";
import useDatabaseStore from "../contexts/DatabaseStore";

interface ResourceRowProps {
  name: string;
  description: string;
  categories: string;
  eligibility: string[];
  eligibilityText: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  expandInit: boolean;
  color: 0 | 1;
}

const ResourceRow: React.FC<ResourceRowProps> = React.memo(
  ({
    name,
    description,
    categories,
    eligibility,
    eligibilityText,
    website,
    phone,
    email,
    address,
    color,
    expandInit,
  }) => {
    const [expand, setExpand] = useState<boolean>(expandInit);
    const [linkHover, setLinkHover] = useState<boolean>(false);
    const selected = useDatabaseStore((state) =>
      state.selectedResources.has(name)
    );
    const addSelectedResource = useDatabaseStore(
      (state) => state.addSelectedResource
    );
    const delSelectedResource = useDatabaseStore(
      (state) => state.delSelectedResource
    );

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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <span className={styles.title}>{name}</span>
          <IconList categories={categories} />
        </div>
        <span>{description}</span>

        <div className={styles.checkbox}>
          {selected ? (
            <MdCheckBox
              size={20}
              onClick={() => {
                delSelectedResource(name);
              }}
            />
          ) : (
            <MdCheckBoxOutlineBlank
              size={20}
              onClick={() => {
                addSelectedResource(name);
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
            title="Visit resource website"
            style={{ color: linkHover ? "#007AFF" : "black" }}
            size={20}
          />
          {expand ? (
            <AiOutlineCompress
              onClick={() => setExpand((prev) => !prev)}
              className={styles.icon}
              title="See less"
              size={22}
            />
          ) : (
            <IoMdExpand
              onClick={() => setExpand((prev) => !prev)}
              className={styles.icon}
              title="See more"
              size={22}
            />
          )}
        </div>
        <AnimatePresence>
          {expand && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
              className={styles.container}
            >
              <div className={styles.spacer}></div>
              <div className={styles.expandedRowContent}>
                {(eligibility[0] || eligibilityText) && (
                  <div className={styles.detailElig}>
                    <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                      Eligibility details
                    </span>
                    {eligibility && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {eligibility.map((x) => (
                          <span key={x}>{x}</span>
                        ))}
                        {eligibilityText && <span>{eligibilityText}</span>}
                      </div>
                    )}
                  </div>
                )}
                <div className={styles.rightContent}>
                  {phone && (
                    <div className={styles.detail}>
                      <div>
                        <FaPhoneFlip size={25} title={"Phone number(s)"} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {phone.split(",").map((number) => (
                          <span key={number}>{number.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {email && (
                    <div className={styles.detail}>
                      <div>
                        <MdEmail size={25} title={"Email(s)"} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{email}</span>
                      </div>
                    </div>
                  )}

                  {address && (
                    <div className={styles.detail}>
                      <div>
                        <IoMdPin size={25} title={"Address"} />
                      </div>
                      <span>{address}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

export default ResourceRow;
