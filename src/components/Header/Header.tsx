import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {

  return (
    <header>
      <section id={styles.left}>
        <h1>Projects</h1>
      </section>
      <section>
        <button id={styles.accountButton}>
          <span id={styles.nameContainer}>Christian Toney</span>
          <span id={styles.avatarContainer}>
            
          </span>
        </button>
      </section>
    </header>
  );

}