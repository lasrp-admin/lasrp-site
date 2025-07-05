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
        <span>
          Welcome to LASRP! We hope that our database will help make it easier
          for providers and patients to quickly find appropriate resources in
          the LA area.
        </span>
        <span>
          To use our search tool, simple add as many filters as you want using
          the drop down menus. We currently support filtering on the resource
          type, intended audience and supported languages.
        </span>
        <span>
          You can select resources by clicking on the empty square the left of
          the names. Selected resources will stay at the top of the list
          regardless of the filters, and you can print out selected resources by
          clicking the printer icon.
        </span>
      </div>
    </div>
  );
};

export default Info;
