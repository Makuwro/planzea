import React from "react";
import Icon from "../Icon/Icon";
import styles from "./BacklogViewModificationOptions.module.css";
import Project from "../../client/Project";
import Task from "../../client/Task";
import { useNavigate } from "react-router-dom";

export default function BacklogViewModificationOptions({project, onTaskCreate}: {project: Project, onTaskCreate: (task: Task) => void}) {

  async function createTask() {

    const taskName = prompt("Enter a task name.");
    if (taskName) {

      const task = await project.createTask({name: taskName});
      onTaskCreate(task);

    }

  }

  const navigate = useNavigate();

  return (
    <section id={styles.viewModificationOptions}>
      <button id={styles.addIssueButton} onClick={createTask}>
        <Icon name="add" />
      </button>
      <span>
        <button onClick={() => navigate(`/personal/projects/${project.id}/settings`)}>
          <Icon name="settings" />
        </button>
      </span>
    </section>
  );

}