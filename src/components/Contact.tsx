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
        href="https://docs.google.com/document/d/1JNMMq1FswgdPg07xm0NN4nwO5YSHqbGY3eFjxF8VCbY/edit?tab=t.0"
        target="_blank"
        style={{ color: "#007AFF" }}
      >
        Feedback form
      </a>
    </div>
  );
};

export default Contact;
