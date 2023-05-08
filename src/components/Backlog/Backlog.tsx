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
  const [selectedBacklogTask, setSelectedBacklogTask] = useState<Task | null>(null);

  useEffect(() => {

    (async () => {

      if (project) {

        setTasks(await project.getTasks());

      } else if (client.personalProjectId) {

        setProject(await client.getProject(client.personalProjectId));

      }

    })();

  }, [project]);

  const deleteTask = async (task: Task) => {

    if (confirm("Are you sure you want to delete this task?")) {

      await task.delete();
      setTasks(tasks.filter((possibleTask) => possibleTask.id !== task.id));
      setSelectedBacklogTask(null);

    }

  };

  useEffect(() => {

    if (selectedBacklogTask) {

      const verifyDeleteButton = async (event: KeyboardEvent) => {

        if (event.key === "Delete") {

          await deleteTask(selectedBacklogTask);

        }

      };

      window.addEventListener("keydown", verifyDeleteButton);
      
      return () => window.removeEventListener("keydown", verifyDeleteButton);

    }

  }, [selectedBacklogTask]);

  return project ? (
    <main id={styles.main}>
      <BacklogViewModificationOptions project={project} onTaskCreate={(task) => setTasks([...tasks, task])} />
      {
        tasks[0] ? (
          <>
            <section id={styles.taskListContainer}>
              <ul id={styles.taskList}>
                {
                  tasks.map((task) => <BacklogTask client={client} key={task.id} task={task} project={project} isSelected={selectedBacklogTask?.id === task.id} onClick={() => setSelectedBacklogTask(task)} onDelete={async () => await deleteTask(task)} onUpdate={(newTask) => setTasks(tasks.map((task) => task.id === newTask.id ? newTask : task))} />)
                }
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