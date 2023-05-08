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
      <button onClick={onClick}>
        <span>
          <button className={styles.status} />
          <span>{name}</span>
        </span>
        <span className={styles.taskOptions}>
          <button onClick={onDelete}>
            <Icon name="delete_forever" />
          </button>
        </span>
      </button>
    </li>
  );

}