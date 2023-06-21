import React from "react";
import Icon from "../Icon/Icon";
import styles from "./BacklogViewModificationOptions.module.css";
import Project from "../../client/Project";
import Task from "../../client/Task";
import { useLocation, useNavigate } from "react-router-dom";

export default function BacklogViewModificationOptions({project, onTaskCreate, selectedTask}: {project: Project, onTaskCreate: (task: Task) => void; selectedTask?: Task}) {

  async function createTask() {

    const taskName = prompt("Enter a task name.");
    if (taskName) {

      const task = await project.createTask({name: taskName});
      onTaskCreate(task);

    }

  }

  const location = useLocation();
  const navigate = useNavigate();

  return (
    <section id={styles.viewModificationOptions}>
      <span>
        <button id={styles.addIssueButton} onClick={createTask}>
          <Icon name="add" />
        </button>
        <button disabled={Boolean(!selectedTask)} onClick={selectedTask ? () => navigate(`${location.pathname}?manage=task-labels&taskId=${selectedTask.id}`, {replace: true}) : undefined}>
          <Icon name="label" />
        </button>
        <button disabled={Boolean(!selectedTask)} onClick={selectedTask ? () => navigate(`${location.pathname}?delete=task&id=${selectedTask.id}`, {replace: true}) : undefined}>
          <Icon name="delete" />
        </button>
      </span>
      <span>
        <button onClick={() => navigate(`/personal/projects/${project.id}/settings`)}>
          <Icon name="settings" />
        </button>
      </span>
    </section>
  );

}