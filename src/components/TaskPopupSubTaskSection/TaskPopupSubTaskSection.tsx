import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Project from "../../client/Project";
import Icon from "../Icon/Icon";
import styles from "./TaskPopupSubTaskSection.module.css";
import Task from "../../client/Task";
import TaskList from "../../client/TaskList";
import Client from "../../client/Client";

type TaskListContainer<T> = {[taskListId: string]: T};

export default function TaskPopupSubTaskSection({client, project, task}: {client: Client; project: Project; task: Task}) {

  const [newTaskNames, setNewTaskNames] = useState<TaskListContainer<string>>({});
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [subTasks, setSubTasks] = useState<TaskListContainer<Task[]>>({});

  const setNewTaskNamesFromId = (taskListId: string, value?: string) => {

    const newNames = {...newTaskNames};
    if (value) {

      newNames[taskListId] = value;

    } else {

      delete newNames[taskListId];

    }
    setNewTaskNames(newNames);

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
      for (const taskList of taskLists) {

        newSubTasks[taskList.id] = [];
        for (const taskId of taskList.taskIds) {

          newSubTasks[taskList.id].push(await client.getTask(taskId));

        }

      }

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
        setNewTaskNamesFromId(newTaskList.id, "");

      }

    };

    const onTaskListDelete = async (taskListId: string) => {

      const index = findTaskListIndex(taskListId);
      if (index !== -1) {

        replaceTaskList(index);
        setNewTaskNamesFromId(taskListId);

      }

    };

    client.addEventListener("taskListDelete", onTaskListDelete);
    client.addEventListener("taskListUpdate", onTaskListUpdate);

    return () => {
      
      client.removeEventListener("taskListDelete", onTaskListDelete);
      client.removeEventListener("taskListUpdate", onTaskListUpdate);

    };

  }, [taskLists]);

  async function removeTask(taskList: TaskList, taskId: string) {

    await taskList.update({taskIds: [...taskList.taskIds].filter((possibleTaskId) => possibleTaskId !== taskId)});
    
  }
  
  return (
    <section>
      <section>
        <button onClick={
          async () => await task.createTaskList()
        }>Create task list</button>
      </section>
      <ul id={styles.taskLists}>
        {
          taskLists[0] ? (
            taskLists.map((taskList) => (
              <li key={taskList.id} className={styles.taskList}>
                <section>
                  <section>
                    <label>{taskList.name}</label>
                    <button onClick={async () => await taskList.delete()}>
                      <Icon name="delete" />
                    </button>
                  </section>
                  <input type="text" placeholder="Add a task..." value={newTaskNames[taskList.id] ?? ""} onChange={(event) => setNewTaskNamesFromId(taskList.id, event.target.value)} onKeyDown={async (event) => event.key === "Enter" ? await taskList.update({taskIds: [...taskList.taskIds, (await project.createTask({name: newTaskNames[taskList.id]})).id]}) : undefined} />
                </section>
                <ul id={styles.tasks}>
                  {
                    taskList.taskIds.map((taskId) => {

                      const subTask = subTasks[taskList.id]?.find((possibleTask) => possibleTask.id === taskId);
                      if (subTask) {

                        const status = project.statuses.find((status) => status.id === subTask.statusId);
                        return (
                          <li key={taskId}>
                            <span>
                              <span style={{color: `#${status?.textColor.toString(16)}`, backgroundColor: `#${status?.backgroundColor.toString(16)}`}}>{status?.name}</span>
                              <Link to={`/personal/projects/${project.id}/tasks/${subTask.id}`}>{subTask.name}</Link>
                            </span>
                            <button onClick={async () => await removeTask(taskList, taskId)}>
                              <Icon name="close" />
                            </button>
                          </li>
                        );
                        
                      }

                      return null;

                    })
                  }
                </ul>
              </li>
            ))
          ) : null
        }
      </ul>
    </section>
  );

}