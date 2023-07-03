import React, { useEffect, useState } from "react";
import Task from "../../client/Task";
import Client from "../../client/Client";
import { Link } from "react-router-dom";
import Icon from "../Icon/Icon";
import styles from "./TaskPopupParentTaskSection.module.css";
import Status from "../../client/Status";

export default function TaskPopupParentTaskSection({childTask, client, parentTaskId, statuses}: {childTask: Task; client: Client; parentTaskId: string; statuses: Status[]}) {

  const [parentTask, setParentTask] = useState<Task | null>(null);

  useEffect(() => {

    (async () => {

      setParentTask(await client.getTask(parentTaskId));

    })();

  }, [parentTaskId]);

  if (parentTask) {

    const status = statuses.find((status) => status.id === parentTask.statusId);

    return (
      <section>
        <label>Tracked by</label>
        <section id={styles.task}>
          <span>
            <span style={{color: `#${status?.color?.toString(16) ?? "gray"}`, backgroundColor: `#${status?.color?.toString(16) ?? "fff"}`}}>{status?.name}</span>
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