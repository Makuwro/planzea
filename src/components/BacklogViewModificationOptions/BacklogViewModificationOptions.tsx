import React from "react";
import Icon from "../Icon/Icon";
import Project from "../../client/Project";
import Task from "../../client/Task";
import { useNavigate } from "react-router-dom";
import HeaderOptions from "../HeaderOptions/HeaderOptions";

export default function BacklogViewModificationOptions({project, onTaskCreate, selectedTask}: {project: Project, onTaskCreate: (task: Task) => void; selectedTask?: Task}) {

  async function createTask() {

    const taskName = prompt("Enter a task name.");
    if (taskName) {

      const task = await project.createTask({name: taskName});
      onTaskCreate(task);

    }

  }

  const navigate = useNavigate();
  return (
    <HeaderOptions>
      <span>
        <button className="singlePixelBorder" onClick={createTask}>
          <Icon name="add" />
        </button>
        <button disabled={Boolean(!selectedTask)} onClick={selectedTask ? () => navigate(`?manage=task-labels&taskId=${selectedTask.id}`, {replace: true}) : undefined}>
          <Icon name="label" />
        </button>
        <button disabled={Boolean(!selectedTask)} onClick={selectedTask ? () => navigate(`?delete=task&id=${selectedTask.id}`, {replace: true}) : undefined}>
          <Icon name="delete" />
        </button>
      </span>
      <span>
        <button onClick={() => navigate(`/personal/projects/${project.id}/settings`)}>
          <Icon name="settings" />
        </button>
      </span>
    </HeaderOptions>
  );

}