import React from "react";
import styles from "./BacklogTask.module.css";
import Icon from "../Icon/Icon";

interface BacklogTaskComponentProperties {
  name: string;
}

export default function BacklogTask({name}: BacklogTaskComponentProperties) {

  return (
    <li className={styles.task}>
      <button>
        <span>
          <button className={styles.status}>

          </button>
          <span>{name}</span>
        </span>
        <section className={styles.taskOptions}>
          <button>
            <Icon name="more_vert" />
          </button>
        </section>
      </button>
    </li>
  );

}