import styles from "../styles/Contact.module.css";
import { MdMail } from "react-icons/md";

const Contact = () => {
  return (
    <div className={styles.contactContainer}>
      <span className={styles.label}>Contact Us</span>
      <div className={styles.email}>
        <MdMail size={30} />
        <span>contact[dot]lasrp[at]gmail[dot]com</span>
      </div>
      <a
        href="https://forms.gle/5hTqrY8TymYpTxcD8"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#007AFF" }}
      >
        Feedback form
      </a>

      {/* contact-only card (acknowledgements moved to separate tile) */}
    </div>
  );
};

export default Contact;
