import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IoMdClose } from "react-icons/io";
import { AiOutlineInfoCircle } from "react-icons/ai";
import styles from "../styles/Acknowledgements.module.css";

const AboutUs = () => {
  const [open, setOpen] = useState(false);
  const portalEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
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
          <h3>About Us</h3>
          <IoMdClose
            onClick={() => setOpen(false)}
            className={styles.closeBtn}
            size={30}
          />
        </div>
        <div className={styles.modalBody}>
          <p>
            This is a short About Us placeholder. Replace with your real project
            description later. For now, here's some filler content to show how
            the modal will look.
          </p>
          <p>
            Our mission is to make data accessible and easy to find. We
            collaborate with partners, researchers, and volunteers to curate
            high-quality resources and tools that support practitioners and
            researchers.
          </p>
          <p>Contributors (filler):</p>
          <ul className={styles.list}>
            <li>
              <strong>Taylor Quinn</strong>
              <span className={styles.note}> — Project lead</span>
            </li>
            <li>
              <strong>Riley Chen</strong>
              <span className={styles.note}> — Engineering</span>
            </li>
            <li>
              <strong>Jordan Patel</strong>
              <span className={styles.note}> — Research</span>
            </li>
          </ul>
        </div>
        {/* no footer; close via header X */}
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
        <span className={styles.title}>About Us</span>
        <AiOutlineInfoCircle className={styles.chev} size={18} />
      </button>

      {open && portalEl.current && createPortal(modalContent, portalEl.current)}
    </div>
  );
};

export default AboutUs;
