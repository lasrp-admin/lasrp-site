import { useState, useEffect } from "react";

import ResourceSearch from "./components/ResourceSearch";
import styles from "./styles/App.module.css";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { FiTable } from "react-icons/fi";
import ArchLogo from "./assets/images/arch_collaborative.svg?react";
import USCLogo from "./assets/images/usc_logo.png";

import Info from "./components/Info";
import SelectedResourcesView from "./components/SelectedResourcesView";
import useLoadDatabase from "./hooks/useLoadDatabase";

const App = () => {
  const [help, setHelp] = useState<boolean>(false);
  const [favorite, setFavorite] = useState<boolean>(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 950);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useLoadDatabase();

  return (
    <main className={styles.main}>
      <div className={styles.sticky}>
        <div className={styles.stickyBar}>
          <div className={styles.iconBarLeft}>
            <div title="Arch Collaborative">
              <ArchLogo
                className={styles.archLogo}
                onClick={() => {
                  window.open("https://www.arch-collaborative.org/", "_blank");
                }}
              />
            </div>
            <div
              title="Keck Human Rights Clinic"
              onClick={() => {
                window.open("https://sites.usc.edu/keckhumanrights/home/");
              }}
            >
              <img src={USCLogo} className={styles.uscLogo} />
            </div>
          </div>
          <div className={styles.iconBarRight}>
            <FaRegStar
              onClick={() => setFavorite(true)}
              size={40}
              title={"View favorite resources"}
              style={{ cursor: "pointer" }}
            />
            <FiTable
              onClick={() => {
                window.open(
                  "https://docs.google.com/spreadsheets/d/1Bpe3AxJnxzBAjRTzWEMYaja1BqaMD1a5EiymTQ_EoHw/edit?usp=sharing",
                  "_blank"
                );
              }}
              size={40}
              title="Raw database"
              style={{ cursor: "pointer" }}
            />
            <FaRegQuestionCircle
              onClick={() => setHelp(true)}
              size={40}
              title="Help"
              style={{ cursor: "pointer" }}
            />
          </div>
          {help && <Info setHelp={setHelp} />}
          {favorite && <SelectedResourcesView setFavorite={setFavorite} />}
          <span className={styles.title}>
            {isMobile ? "LASRP" : "Los Angeles Social Resources for Patients"}
          </span>
        </div>
      </div>
      <ResourceSearch />
    </main>
  );
};

export default App;
