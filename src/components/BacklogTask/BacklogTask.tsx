import React from "react";
import styles from "./BacklogTask.module.css";
import Icon from "../Icon/Icon";

interface BacklogTaskComponentProperties {
  isSelected: boolean;
  name: string;
  onClick: () => void;
  onDelete: () => void;
}

export default function BacklogTask({name, isSelected, onClick, onDelete}: BacklogTaskComponentProperties) {

  return (
    <li className={`${styles.task}${isSelected ? ` ${styles.selected}` : ""}`}>
      <button onClick={onClick} />
      <section>
        <span>
          <section className={styles.statusContainer}>
            <button className={styles.status} />
          </section>
          <span>{name}</span>
        </span>
        <span className={styles.taskOptions}>
          <button onClick={onDelete}>
            <Icon name="delete_forever" />
          </button>
        </span>
      </section>
      <section className={styles.statusSelectorContainer}>
        <section className={styles.statusSelector}>
          <ul>
            <li>
              <button>Not Started</button>
            </li>
            <li>
              <button>In Progress</button>
            </li>
            <li>
              <button>Completed</button>
            </li>
          </ul>
        </section>
      </section>
    </li>
  );

}