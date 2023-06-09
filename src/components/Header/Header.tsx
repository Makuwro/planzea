import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {

  return (
    <header>
      <section id={styles.left}>
        <Link to={"/"}>
          Projects
        </Link>
      </section>
      <section id={styles.right}>
        <button id={styles.accountButton}>
          <span id={styles.nameContainer}>Personal</span>
          <span id={styles.avatarContainer}>
            
          </span>
        </button>
      </section>
    </header>
  );

}