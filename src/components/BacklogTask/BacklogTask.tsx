import React, { useEffect, useRef, useState } from "react";
import styles from "./BacklogTask.module.css";
import Project from "../../client/Project";
import Task from "../../client/Task";
import completeSound from "../../complete.ogg";
import Label from "../../client/Label";
import ContextMenu from "../ContextMenu/ContextMenu";
import LabelButton from "../LabelButton/LabelButton";
import Status from "../../client/Status";

interface BacklogTaskComponentProperties {
  isSelected: boolean;
  task: Task;
  project: Project;
  onClick: () => void;
}

export default function BacklogTask({task, project, isSelected, onClick}: BacklogTaskComponentProperties) {

  const [isStatusSelectorOpen, setIsStatusSelectorOpen] = useState<boolean>(false);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);

  useEffect(() => {

    (async () => {
      
      if (project) {
        
        setStatuses(await project.getStatuses());

      }

    })();

  }, [project]);

  const status = statuses.find((status) => status.id === task.statusId);
  const statusHexBG = status ? `#${status?.backgroundColor?.toString(16) ?? "fff"}` : undefined;

  async function setStatus(newStatusId: string) {

    if (task.statusId !== newStatusId) {

      await task.update({statusId: newStatusId});

      // Make a sound if the task is completed.
      if (newStatusId === "dc") {

        const audio = new Audio(completeSound);
        audio.play();

      }

    }

    setIsStatusSelectorOpen(false);

  }

  const [labels, setLabels] = useState<Label[]>([]);
  useEffect(() => {

    (async () => {

      const labelIds = task.labelIds ?? [];
      const labels = (await project.getLabels()).filter((label) => labelIds.includes(label.id));
      setLabels(labels);

    })();

  }, [task]);

  // Make a due date.
  const dueDate = task.dueDate ? new Date(task.dueDate) : undefined;
  const dueMonth = dueDate ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dueDate.getMonth()] : undefined;

  // Keep track of touch times.
  const [touchStartTime, setTouchStartTime] = useState<number>(0);

  return (
    <li>
      <section className={`${styles.task}${isSelected ? ` ${styles.selected}` : ""}`} onClick={onClick} onTouchStart={() => setTouchStartTime(new Date().getTime())} onTouchEnd={() => {

        const touchEndTime = new Date().getTime();

        if (touchEndTime - touchStartTime <= 500) {

          onClick();
          onClick();

        }

        setTouchStartTime(0);

      }}>
        <span>
          <section className={styles.statusContainer} onClick={(event) => event.stopPropagation()}>
            <button className={styles.status} onClick={() => setIsStatusSelectorOpen(!isStatusSelectorOpen)} ref={statusButtonRef} style={{backgroundColor: statusHexBG}} />
          </section>
          <span style={task.statusId === "dc" ? {color: "#9d9d9d"} : undefined}>
            {task.name}
          </span>
          <ul className={styles.labels}>
            {
              labels.map((label) => (
                <LabelButton key={label.id} label={label} onRemove={async () => await task.update({labelIds: task.labelIds.filter((possibleLabelId) => possibleLabelId !== label.id)})} />
              ))
            }
          </ul>
        </span>
        <span>
          {dueMonth && dueDate ? <span>{dueMonth} {dueDate.getDate() + 1}</span> : null}
        </span>
      </section>
      {isStatusSelectorOpen ? <ContextMenu isOpen options={statuses.map((status) => ({label: status.name, onClick: (event) => {
        
        event.stopPropagation();
        setStatus(status.id);
      
      }}))} onOutsideClick={() => setIsStatusSelectorOpen(false)} triggerElement={statusButtonRef.current} /> : null}
    </li>
  );

}