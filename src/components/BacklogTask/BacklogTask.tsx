import React, { useEffect, useRef, useState } from "react";
import styles from "./BacklogTask.module.css";
import Icon from "../Icon/Icon";
import Project from "../../client/Project";
import Task from "../../client/Task";
import Client from "../../client/Client";
import completeSound from "../../complete.ogg";

interface BacklogTaskComponentProperties {
  client: Client;
  isSelected: boolean;
  task: Task;
  project: Project;
  onClick: () => void;
  onDelete: () => void;
  onUpdate: (newTask: Task) => void;
}

export default function BacklogTask({client, task, project, isSelected, onClick, onDelete, onUpdate}: BacklogTaskComponentProperties) {

  const [isStatusSelectorOpen, setIsStatusSelectorOpen] = useState<boolean>(false);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const statusSelectorRef = useRef<HTMLElement>(null);

  useEffect(() => {

    const checkForOutsideClick = (event: MouseEvent) => {

      if (event.target && !statusSelectorRef.current?.contains(event.target as Node) && !statusButtonRef.current?.contains(event.target as Node)) {

        setIsStatusSelectorOpen(false);

      }

    };

    window.addEventListener("click", checkForOutsideClick);

    return () => window.removeEventListener("click", checkForOutsideClick);

  }, []);

  const status = project.statuses.find((status) => status.id === task.statusId);
  const statusHexBG = status ? `#${status.backgroundColor.toString(16)}` : undefined;

  async function setStatus(newStatusId: string) {

    if (task.statusId !== newStatusId) {

      await task.update({statusId: newStatusId});
      task.statusId = newStatusId;
      onUpdate(new Task(structuredClone(task), client));

      // Make a sound if the task is completed.
      if (newStatusId === "dc") {

        const audio = new Audio(completeSound);
        audio.play();

      }

    }

    setIsStatusSelectorOpen(false);

  }

  return (
    <li className={`${styles.task}${isSelected ? ` ${styles.selected}` : ""}`}>
      <button onClick={onClick} />
      <section>
        <span>
          <section className={styles.statusContainer}>
            <button className={styles.status} onClick={() => setIsStatusSelectorOpen(!isStatusSelectorOpen)} ref={statusButtonRef} style={{backgroundColor: statusHexBG}} />
          </section>
          <span style={task.statusId === "dc" ? {color: "#9d9d9d"} : undefined}>{task.name}</span>
        </span>
        <span className={styles.taskOptions}>
          <button onClick={onDelete}>
            <Icon name="delete_forever" />
          </button>
        </span>
      </section>
      <section className={`${styles.statusSelectorContainer}${isStatusSelectorOpen ? ` ${styles.open}` : ""}`}>
        <section className={styles.statusSelector} ref={statusSelectorRef}>
          <ul>
            {
              project.statuses.map((status) => (
                <li key={status.id}>
                  <button onClick={() => setStatus(status.id)}>
                    {status.name}
                  </button>
                </li>
              ))
            }
          </ul>
        </section>
      </section>
    </li>
  );

}