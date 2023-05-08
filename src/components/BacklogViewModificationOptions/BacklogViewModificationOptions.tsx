import React from "react";
import Icon from "../Icon/Icon";
import styles from "./BacklogViewModificationOptions.module.css";

export default function BacklogViewModificationOptions() {

  return (
    <section id={styles.viewModificationOptions}>
      <button id={styles.addIssueButton}>
        <Icon name="add" />
      </button>
      <span>
        <button>Group by: Nothing</button>
        <button>Sort by: Custom</button>
      </span>
    </section>
  );

}