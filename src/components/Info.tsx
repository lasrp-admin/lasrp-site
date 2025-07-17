import React, { type SetStateAction } from "react";

import { IoMdClose } from "react-icons/io";

import styles from "../styles/Info.module.css";

interface InfoProps {
  setHelp: React.Dispatch<SetStateAction<boolean>>;
}

const Info: React.FC<InfoProps> = ({ setHelp }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.infoBox}>
        <IoMdClose
          onClick={() => setHelp(false)}
          className={styles.toggle}
          size={30}
        />
        <span className={styles.text}>
          Welcome to LASRP! We hope that our database will help make it easier
          for providers and patients to quickly find appropriate resources in
          the LA area.
        </span>
        <span className={styles.text}>
          To use our search tool, simply add as many filters as you want using
          the drop down menus. We currently support filtering on the resource
          type, intended audience, supported languages and neighborhood of the
          resource, along with a few miscellaneous categories.
        </span>
        <span className={styles.text}>
          You can select resources by clicking on the empty square the left of
          the names. Selected resources can be viewed by clicking the star at
          the top right of the page, and can be printed out by clicking the
          printer icon.
        </span>
      </div>
    </div>
  );
};

export default Info;
