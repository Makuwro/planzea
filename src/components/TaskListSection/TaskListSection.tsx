import React, { RefObject, useEffect, useRef, useState } from "react";
import TaskList from "../../client/TaskList";
import styles from "./TaskListSection.module.css";
import { Coordinates, TaskListSettings } from "../TaskPopupSubTaskSection/TaskPopupSubTaskSection";
import Icon from "../Icon/Icon";
import { Link } from "react-router-dom";
import Task from "../../client/Task";
import Project from "../../client/Project";
import { createPortal } from "react-dom";
import Status from "../../client/Status";
import StatusSelector from "../StatusSelector/StatusSelector";

interface TaskListSectionProperties { 
  setTaskListSettings?: (taskListSettings: TaskListSettings[string]) => void; 
  project: Project; 
  isGrabbed?: boolean; 
  taskList: TaskList; 
  taskListSettings: TaskListSettings[string]; 
  originalBoxRef?: RefObject<HTMLElement> | null; 
  onGrab?: (originalBox: RefObject<HTMLElement>, initialCoordinates: Coordinates) => void; 
  taskObjects: Task[]; 
  initialCoordinates?: Coordinates | null;
  coordinates?: Coordinates | null;
  setTaskListBoundary?: (bounds: number) => void;
  popupContainerRef?: RefObject<HTMLElement>; 
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  statuses: Status[];
}

export default function TaskListSection({ onMoveUp, onMoveDown, coordinates, initialCoordinates, setTaskListSettings, taskListSettings, taskList, onGrab, isGrabbed, originalBoxRef, taskObjects, project, popupContainerRef, setTaskListBoundary, statuses }: TaskListSectionProperties) {

  const isEditingName = taskListSettings?.isEditingName;
  const newTaskListName = taskListSettings?.name;

  async function removeTask(taskList: TaskList, taskId: string) {

    await taskList.update({ taskIds: [...taskList.taskIds].filter((possibleTaskId) => possibleTaskId !== taskId) });

  }

  const box = originalBoxRef?.current;
  const [rect, setRect] = box ? useState<DOMRect | null>(box.getBoundingClientRect()) : [undefined, undefined];

  useEffect(() => {

    if (box && rect) {

      const onResize = () => {

        setRect(box.getBoundingClientRect());

      };

      window.addEventListener("resize", onResize);

      return () => {
        
        window.removeEventListener("resize", onResize);

      };

    }

  }, [rect]);

  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {

    if (setTaskListBoundary && ref.current) {

      const box = ref.current.getBoundingClientRect();
      setTaskListBoundary(box.top);

    }

  }, [rect]);

  const stopPropagation = (event: React.MouseEvent) => event.stopPropagation();

  const comp = (
    <li
      ref={ref}
      key={taskList.id}
      className={`${styles.taskList}${coordinates ? ` ${styles.grabbing}` : ""}${isGrabbed ? ` ${styles.lowOpacity}` : ""}`}
      style={initialCoordinates && coordinates && rect ? {
        left: coordinates[0] - (initialCoordinates[0] - rect.left),
        top: coordinates[1] - (initialCoordinates[1] - rect.top),
        width: rect.width
      } : undefined}
      onMouseDown={(event) => {

        event.preventDefault();
        if (event.buttons === 1 && onGrab) onGrab(ref, [event.clientX, event.clientY]);

      }}>
      <section>
        <section>
          {
            isEditingName ? (
              <input
                type="text"
                value={newTaskListName ?? ""}
                placeholder={taskList.name}
                onChange={(event) => setTaskListSettings ? setTaskListSettings({ ...taskListSettings, name: event.target.value }) : undefined}
                onMouseDown={stopPropagation}
                onKeyDown={(async (event) => setTaskListSettings ? event.key === "Enter" ? taskListSettings.name && taskListSettings.name !== taskList.name ? await taskList.update({ name: taskListSettings.name }) : setTaskListSettings({ ...taskListSettings, isEditingName: false }) : undefined : undefined)} />
            ) : (
              <label onMouseDown={stopPropagation}>{taskList.name}</label>
            )
          }
          <span className={styles.taskListOptions} onMouseDown={stopPropagation}>
            <button disabled={!onMoveUp} onClick={onMoveUp}>
              <Icon name="arrow_upward" />
            </button>
            <button disabled={!onMoveDown} onClick={onMoveDown}>
              <Icon name="arrow_downward" />
            </button>
            <button onClick={setTaskListSettings ? () => setTaskListSettings({ ...taskListSettings, isEditingName: !isEditingName }) : undefined}>
              <Icon name={`edit${isEditingName ? "_off" : ""}`} />
            </button>
            <button onClick={async () => await taskList.delete()}>
              <Icon name="delete" />
            </button>
          </span>
        </section>
      </section>
      {
        taskList.taskIds[0] ? (
          <ul className={styles.tasks}>
            {
              taskList.taskIds.map((taskId) => {

                const subTask = taskObjects?.find((possibleTask) => possibleTask.id === taskId);
                if (subTask) {

                  const status = statuses.find((status) => status.id === subTask.statusId);
                  return (
                    <li key={taskId}>
                      <span>
                        {
                          status ? <StatusSelector selectedStatus={status} statuses={statuses} onChange={async (newStatus) => await subTask.update({statusId: newStatus.id})} /> : null
                        }
                        <Link onMouseDown={stopPropagation} to={`/personal/projects/${project.id}/tasks/${subTask.id}`}>{subTask.name}</Link>
                      </span>
                      <button onMouseDown={stopPropagation} onClick={async () => await removeTask(taskList, taskId)}>
                        <Icon name="close" />
                      </button>
                    </li>
                  );

                }

                return null;

              })
            }
          </ul>
        ) : null
      }
      <input
        type="text"
        placeholder="Add a task..."
        value={taskListSettings.taskName ?? ""}
        onChange={(event) => setTaskListSettings ? setTaskListSettings({ ...taskListSettings, taskName: event.target.value }) : undefined}
        onMouseDown={stopPropagation}
        onKeyDown={async (event) => event.key === "Enter" && taskListSettings.taskName ? await taskList.update({ taskIds: [...taskList.taskIds, (await project.createTask({ name: taskListSettings.taskName })).id] }) : undefined} />
    </li>
  );

  return coordinates && popupContainerRef?.current ? createPortal(comp, popupContainerRef.current) : comp;

}