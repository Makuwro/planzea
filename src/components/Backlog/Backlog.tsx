import React, { useState } from "react";
import styles from "./Backlog.module.css";
import Issue from "../../client/Task";
import BacklogTask from "../BacklogTask/BacklogTask";
import Icon from "../Icon/Icon";
import BacklogViewModificationOptions from "../BacklogViewModificationOptions/BacklogViewModificationOptions";

export default function Backlog() {

  const [projects] = useState<Issue[]>([]);
  const [selectedBacklogTaskId, setSelectedBacklogTaskId] = useState<string | null>(null);

  return (
    <main id={styles.main}>
      <BacklogViewModificationOptions />
      {
        projects[0] ? (
          <>
            <section id={styles.taskListContainer}>
              <ul id={styles.taskList}>
                <BacklogTask name="Publish The Showrunners" />
                <BacklogTask name="Design Siletrus' character reference sheet" />
                <BacklogTask name="Do something with Lithicus Drakarox" />
              </ul>
            </section>
          </>
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