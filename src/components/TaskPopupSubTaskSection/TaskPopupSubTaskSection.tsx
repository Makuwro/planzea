import React, { RefObject, useEffect, useState } from "react";
import Project from "../../client/Project";
import styles from "./TaskPopupSubTaskSection.module.css";
import Task from "../../client/Task";
import TaskList from "../../client/TaskList";
import Client from "../../client/Client";
import TaskListSection from "../TaskListSection/TaskListSection";

type TaskListContainer<T> = {[taskListId: string]: T};

export type Coordinates = [number, number];

export type TaskListSettings = TaskListContainer<{
  name?: string;
  isEditingName?: boolean;
  taskName?: string;
}>;

export default function TaskPopupSubTaskSection({client, project, task, popupContainerRef}: {client: Client; project: Project; task: Task; popupContainerRef: RefObject<HTMLElement>}) {

  const [newTaskListSettings, setNewTaskListSettings] = useState<TaskListSettings>({});
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [subTasks, setSubTasks] = useState<TaskListContainer<Task[]>>({});

  const setNewTaskSettingsById = (taskListId: string, value?: TaskListSettings[0]) => {

    const newSettings = {...newTaskListSettings};
    if (value) {

      newSettings[taskListId] = value;

    } else {

      delete newSettings[taskListId];

    }
    setNewTaskListSettings(newSettings);

  };

  useEffect(() => {

    (async () => {

      // Get all tasks in the task lists.
      const taskLists = [];
      const brokenTaskListIds: string[] = [];
      for (const taskListProperties of task.taskLists ?? []) {

        try {
          
          const taskList = await client.getTaskList(taskListProperties.id);

          if (!brokenTaskListIds[0]) {

            taskLists.push(taskList);

          }

        } catch (err) {

          brokenTaskListIds.push(taskListProperties.id);

        }

      }

      if (brokenTaskListIds[0]) {

        await task.update({taskLists: task.taskLists?.filter((possibleTaskList) => !brokenTaskListIds.includes(possibleTaskList.id))});

      } else {
        
        setTaskLists(taskLists);

      }

    })();

  }, [client, project, task]);

  useEffect(() => {

    (async () => {

      const newSubTasks: TaskListContainer<Task[]> = {};
      const newTaskListSettings: TaskListSettings = {};
      for (const taskList of taskLists) {

        newSubTasks[taskList.id] = [];
        newTaskListSettings[taskList.id] = {};
        for (const taskId of taskList.taskIds) {

          newSubTasks[taskList.id].push(await client.getTask(taskId));

        }

      }

      setNewTaskListSettings(newTaskListSettings);
      setSubTasks(newSubTasks);
  
    })();

    const findTaskListIndex = (taskListId: string) => taskLists.findIndex((possibleTaskList) => possibleTaskList.id === taskListId);

    const replaceTaskList = (taskListIndex: number, replacementList?: TaskList) => {

      const newTaskLists = [...taskLists];
      replacementList ? newTaskLists.splice(taskListIndex, 1, replacementList) : newTaskLists.splice(taskListIndex, 1);
      setTaskLists(newTaskLists);

    };

    const onTaskListUpdate = async (newTaskList: TaskList) => {

      const index = findTaskListIndex(newTaskList.id);
      if (index !== -1) {

        replaceTaskList(index, newTaskList);
        setNewTaskSettingsById(newTaskList.id, {});

      }

    };

    const onTaskListDelete = async (taskListId: string) => {

      const index = findTaskListIndex(taskListId);
      if (index !== -1) {

        replaceTaskList(index);
        setNewTaskSettingsById(taskListId);

      }

    };

    client.addEventListener("taskListDelete", onTaskListDelete);
    client.addEventListener("taskListUpdate", onTaskListUpdate);

    return () => {
      
      client.removeEventListener("taskListDelete", onTaskListDelete);
      client.removeEventListener("taskListUpdate", onTaskListUpdate);

    };

  }, [taskLists]);

  const [grabbedTaskList, setGrabbedTaskList] = useState<TaskList | null>(null);
  const [taskListBoundaries, setTaskListBoundaries] = useState<number[] | null>(null);
  const [initialCoordinates, setInitialCoordinates] = useState<Coordinates | null>([0, 0]);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  useEffect(() => {

    const onMouseUp = async () => {

      if (grabbedTaskList) {

        setGrabbedTaskList(null);

        // Check if any of the indices changed.
        const newTaskListIds = taskLists.map((taskList) => taskList.id);
        for (let i = 0; newTaskListIds.length > i; i++) {

          if (newTaskListIds[i] !== task.taskLists?.[i].id) {

            await task.update({taskLists: taskLists.map((taskList) => ({name: taskList.name, id: taskList.id, taskIds: taskList.taskIds}))});
            break;

          }

        }

      }

    };

    const onMouseMove = (event: MouseEvent) => {
  
      if (grabbedTaskList && taskListBoundaries) {

        setCoordinates([event.clientX, event.clientY]);
        let newIndex = 0;
        for (const boundary of taskListBoundaries) {

          if (boundary > event.clientY) {

            newIndex--;
            break;

          }

          newIndex++;
          
        }

        if (newIndex > -1) {

          const grabbedTaskListIndex = taskLists.indexOf(grabbedTaskList);
          if (grabbedTaskListIndex > -1 && newIndex !== grabbedTaskListIndex) {

            const newTaskLists = [...taskLists];
            newTaskLists.splice(grabbedTaskListIndex, 1);
            newTaskLists.splice(newIndex, 0, grabbedTaskList);
            setTaskLists(newTaskLists);

          }

        }

      }

    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

    };

  }, [coordinates, grabbedTaskList, taskListBoundaries]);
  
  const [originalBoxRef, setOriginalBox] = useState<RefObject<HTMLElement> | null>(null);

  console.log(taskListBoundaries);

  return (
    <section>
      <section>
        <button onClick={
          async () => await task.createTaskList()
        }>Create task list</button>
      </section>
      <ul id={styles.taskLists}>
        {
          grabbedTaskList ? (
            <TaskListSection
              originalBoxRef={originalBoxRef}
              taskList={grabbedTaskList}
              taskListSettings={newTaskListSettings[grabbedTaskList.id]}
              taskObjects={subTasks[grabbedTaskList.id]}
              coordinates={coordinates}
              initialCoordinates={initialCoordinates}
              popupContainerRef={popupContainerRef}
              project={project} />
          ) : null
        }
        {
          taskLists[0] ? (
            taskLists.map((taskList, index) => {
              
              const taskListSettings = newTaskListSettings[taskList.id];
              return taskListSettings ? (
                <TaskListSection 
                  key={taskList.id} 
                  isGrabbed={taskList === grabbedTaskList}
                  taskList={taskList} 
                  onGrab={(originalBoxRef, initialCoordinates) => {
                    
                    setGrabbedTaskList(taskList);
                    setOriginalBox(originalBoxRef);
                    setCoordinates(initialCoordinates);
                    setInitialCoordinates(initialCoordinates);
                  
                  }}
                  setTaskListBoundary={(boundary) => {
                    
                    setTaskListBoundaries((oldBoundaries) => {

                      const boundaries = [...(oldBoundaries ?? [])];
                      boundaries[index] = boundary;
                      return boundaries;

                    });
                  
                  }}
                  setTaskListSettings={(newSettings) => setNewTaskSettingsById(taskList.id, newSettings)}
                  taskListSettings={taskListSettings}
                  taskObjects={subTasks[taskList.id]}
                  project={project} />
              ) : undefined;

            })
          ) : null
        }
      </ul>
    </section>
  );

}