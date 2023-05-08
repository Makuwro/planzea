import React, { useEffect, useState } from "react";
import styles from "./Backlog.module.css";
import BacklogTask from "../BacklogTask/BacklogTask";
import BacklogViewModificationOptions from "../BacklogViewModificationOptions/BacklogViewModificationOptions";
import Client from "../../client/Client";
import Project from "../../client/Project";
import Task from "../../client/Task";

export default function Backlog({client}: {client: Client}) {

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedBacklogTaskId, setSelectedBacklogTaskId] = useState<string | null>(null);

  useEffect(() => {

    (async () => {

      if (project) {

        setTasks(await project.getTasks());

      } else if (client.personalProjectId) {

        setProject(await client.getProject(client.personalProjectId));

      }

    })();

  }, [project]);

  return project ? (
    <main id={styles.main}>
      <BacklogViewModificationOptions project={project} />
      {
        tasks[0] ? (
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
  ) : null;

}