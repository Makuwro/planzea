import React from "react";
import styles from "./BacklogTask.module.css";
import Icon from "../Icon/Icon";

interface BacklogTaskComponentProperties {
  isSelected: boolean;
  name: string;
  onClick: () => void;
}

export default function BacklogTask({name, isSelected, onClick}: BacklogTaskComponentProperties) {

  return (
    <li className={`${styles.task}${isSelected ? ` ${styles.selected}` : ""}`}>
      <button onClick={onClick}>
        <span>
          <button className={styles.status}>

          </button>
          <span>{name}</span>
        </span>
      </button>
    </li>
  );

}