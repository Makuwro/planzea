import React, { useEffect, useState } from "react";
import Task from "../../client/Task";
import Client from "../../client/Client";
import { Link } from "react-router-dom";
import Icon from "../Icon/Icon";
import Project from "../../client/Project";
import styles from "./TaskPopupParentTaskSection.module.css";

export default function TaskPopupParentTaskSection({childTask, client, parentTaskId, project}: {childTask: Task; client: Client; parentTaskId: string; project: Project}) {

  const [parentTask, setParentTask] = useState<Task | null>(null);

  useEffect(() => {

    (async () => {

      setParentTask(await client.getTask(parentTaskId));

    })();

  }, [parentTaskId]);

  if (parentTask) {

    const status = project.statuses.find((status) => status.id === parentTask.statusId);

    return (
      <section>
        <label>Parent task</label>
        <section id={styles.task}>
          <span>
            <span style={{color: `#${status?.textColor.toString(16)}`, backgroundColor: `#${status?.backgroundColor.toString(16)}`}}>{status?.name}</span>
            <Link to={`/personal/projects/${parentTask.projectId}/tasks/${parentTask.id}`}>{parentTask.name}</Link>
          </span>
          <button onClick={async () => await childTask.update({parentTaskId: undefined})}>
            <Icon name="close" />
          </button>
        </section>
      </section>
    );

  }

  return null;

}