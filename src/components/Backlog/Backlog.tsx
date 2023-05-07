import React, { useState } from "react";
import styles from "./Backlog.module.css";
import Project from "../../client/Project";
import Issue from "../../client/Issue";
import Icon from "../Icon/Icon";
import BacklogTask from "../BacklogTask/BacklogTask";

export default function Backlog() {

  const [projects] = useState<Issue[]>([]);

  return (
    <main id={styles.main}>
      {
        !projects[0] ? (
          <section id={styles.taskListContainer}>
            <section id={styles.columnTitles}>
              <label>Name</label>
              <label>Status</label>
              <label>Assignees</label>
            </section>
            <ul id={styles.taskList}>
              <BacklogTask name="Publish The Showrunners" />
            </ul>
          </section>
        ) : (
          <section id={styles.noTasksMessage}>
            <h1>That's a wrap!</h1>
            <p>You don't have any more tasks. Good job!</p>
          </section>
        )
      }
    </main>
  );

}