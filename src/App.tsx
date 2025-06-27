import ResourceSearch from "./components/ResourceSearch";
import styles from "./styles/App.module.css";

const App = () => {
  return (
    <main className={styles.main}>
      <span className={styles.title}>
        Los Angeles Social Resources for Patients
      </span>
      <span className={styles.text}>
        LASRP is a resource aimed at helping providers & patients take advantage
        of resources available to them in a variety of categories. You can get
        started by adding your desired filters below and hitting search.
      </span>
      <ResourceSearch />
      <span style={{ marginBottom: "10px" }}>
        <a
          href="https://github.com/AtonalDev/lasrp"
          target="_blank"
          style={{ color: "#007AFF" }}
        >
          Code{" "}
        </a>
        by
        <a
          href="https://github.com/AtonalDev"
          target="_blank"
          style={{ color: "#007AFF" }}
        >
          {" "}
          Atonal
        </a>
      </span>
    </main>
  );
};

export default App;
