import styles from "../styles/ResourceRow.module.css";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { IoMdExpand } from "react-icons/io";
import { AiOutlineCompress } from "react-icons/ai";
import { GoGlobe } from "react-icons/go";
import { MdPeople } from "react-icons/md";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { MdCheckBox } from "react-icons/md";
import { FaPhoneFlip } from "react-icons/fa6";
import { IoMdPin } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { useDatabaseContext } from "../contexts/DatabaseContext";

import IconList from "./IconList";
import type { ResourceType } from "../types/types";

interface ResourceRowProps {
  name: string;
  description: string;
  categories: ResourceType[];
  eligibility: string[];
  eligibilityText: string;
  website: string;
  phone1: string;
  phone2: string;
  mail1: string;
  mail2: string;
  address: string;
  expandInit: boolean;
  selected: boolean;
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
    phone1,
    phone2,
    mail1,
    mail2,
    address,
    color,
    expandInit,
    selected,
  }) => {
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
            >
              <div className={styles.spacer}></div>
              <div className={styles.rowContent}>
                {(eligibility[0] || eligibilityText) && (
                  <div className={styles.detail}>
                    <div>
                      <MdPeople size={35} title={"Eligibility details"} />
                    </div>
                    {eligibility && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        {eligibility.map((x) => (
                          <span key={x} style={{ fontWeight: "bold" }}>
                            {x}
                          </span>
                        ))}
                        {eligibilityText && <span>{eligibilityText}</span>}
                      </div>
                    )}
                  </div>
                )}

                {phone1 && (
                  <div className={styles.detail}>
                    <div>
                      <FaPhoneFlip size={25} title={"Phone number(s)"} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span>{phone1}</span>
                      <span>{phone2}</span>
                    </div>
                  </div>
                )}

                {mail1 && (
                  <div className={styles.detail}>
                    <div>
                      <MdEmail size={25} title={"Email(s)"} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span>{mail1}</span>
                      <span>{mail2}</span>
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

export default ResourceRow;
