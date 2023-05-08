import React from "react";
import Icon from "../Icon/Icon";
import styles from "./BacklogViewModificationOptions.module.css";
import Project from "../../client/Project";
import Task from "../../client/Task";

export default function BacklogViewModificationOptions({project, onTaskCreate}: {project: Project, onTaskCreate: (task: Task) => void}) {

  async function createTask() {

    const taskName = prompt("Enter a task name.");
    if (taskName) {

      const task = await project.createTask({name: taskName});
      onTaskCreate(task);

    }

  }

  return (
    <section id={styles.viewModificationOptions}>
      <button id={styles.addIssueButton} onClick={createTask}>
        <Icon name="add" />
      </button>
      <span>
        <button>Group by: Nothing</button>
        <button>Sort by: Custom</button>
      </span>
    </section>
  );

}