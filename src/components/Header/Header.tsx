import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import Icon from "../Icon/Icon";

export default function Header() {

  return (
    <header>
      <section id={styles.left}>
        {/* <button id={styles.projectSelector}>Personal</button>
        <nav>
          <Link to="/personal/projects/tasks" className={styles.selected}>Tasks</Link>
          <Link to="/calendar">Calendar</Link>
        </nav> */}
        <Link to={"/"}>
          Planzea
        </Link>
      </section>
      <section id={styles.right}>
        <button id={styles.accountButton}>
          <span id={styles.nameContainer}>Christian Toney</span>
          <span id={styles.avatarContainer}>
            
          </span>
        </button>
      </section>
    </header>
  );

}