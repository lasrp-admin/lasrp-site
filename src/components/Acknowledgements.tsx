import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IoMdClose } from "react-icons/io";
import { FaHandsHelping } from "react-icons/fa";
import styles from "../styles/Acknowledgements.module.css";

const contributors = [
  { name: "Keck Human Rights Student Interest Group", note: "" },
  { name: "Arthur Bookstein", note: "" },
  { name: "Ashley Hernandez Gutierrez", note: "" },
  { name: "Carson McNeill", note: "" },
  { name: "Grace Kim", note: "" },
  { name: "Justine Po", note: "" },
  { name: "Manan Chopra", note: "" },
  { name: "Michelle Dong", note: "" },
  { name: "Michelle Koh", note: "" },
  { name: "Zara Mubin", note: "" },
];

const Acknowledgements = () => {
  const [open, setOpen] = useState(false);

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const portalEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // create a container div for the portal and append to body
    const el = document.createElement("div");
    portalEl.current = el;
    document.body.appendChild(el);
    return () => {
      if (portalEl.current) {
        document.body.removeChild(portalEl.current);
        portalEl.current = null;
      }
    };
  }, []);

  const modalContent = (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Acknowledgements</h3>
          <IoMdClose
            onClick={() => setOpen(false)}
            className={styles.closeBtn}
            size={30}
          />
        </div>
        <div className={styles.modalBody}>
          <p>
            We thank the following people and organizations for their
            contributions to this project:
          </p>
          <ul className={styles.list}>
            {contributors.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong>
                {/* <span className={styles.note}> — {p.note}</span> */}
              </li>
            ))}
          </ul>
        </div>
        {/* footer removed - use header X to close */}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <button
        className={styles.tile}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={styles.title}>Acknowledgements</span>
        <FaHandsHelping className={styles.chev} size={18} />
      </button>

      {open && portalEl.current && createPortal(modalContent, portalEl.current)}
    </div>
  );
};

export default Acknowledgements;
