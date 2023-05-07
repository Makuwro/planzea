import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import Icon from "../Icon/Icon";

export default function Header() {

  return (
    <header>
      <section id={styles.left}>
        <button>Personal</button>
        <nav>
          <Link to="/tasks" className={styles.selected}>Tasks</Link>
          <Link to="/calendar">Calendar</Link>
        </nav>
      </section>
      <section id={styles.right}>
        <button id={styles.addIssueButton}>
          <Icon name="add" />
        </button>
        <button id={styles.accountButton}>
          <span id={styles.nameContainer}>Christian Toney</span>
          <span id={styles.avatarContainer}>
            
          </span>
        </button>
      </section>
    </header>
  );

}