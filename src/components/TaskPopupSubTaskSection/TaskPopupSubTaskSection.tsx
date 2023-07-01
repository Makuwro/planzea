import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Project from "../../client/Project";
import Icon from "../Icon/Icon";
import styles from "./TaskPopupSubTaskSection.module.css";
import Task from "../../client/Task";
import TaskList from "../../client/TaskList";
import Client from "../../client/Client";

export default function TaskPopupSubTaskSection({client, project, task}: {client: Client; project: Project; task: Task}) {

  const [newTaskNames, setNewTaskNames] = useState<string[]>([]);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [subTasks, setSubTasks] = useState<Task[]>([]);

  const setNewTaskNamesFromIndex = (index: number, value: string) => {

    const newNames = [...newTaskNames];
    newNames[index] = value;
    setNewTaskNames(newNames);

  };

  useEffect(() => {

    (async () => {

      setNewTaskNames([]);
      setSubTasks((await project.getTasks()).filter((possibleSubTask) => task.taskLists?.find((taskList) => taskList.taskIds.includes(possibleSubTask.id))));
      setTaskLists((await client.getTaskLists()).filter((possibleTaskList) => task.taskLists?.find((taskList) => taskList.id === possibleTaskList.id)));

    })();

  }, [project, task]);

  async function deleteSubTask(subTask: Task) {

    if (confirm("Are you sure you want to delete this task?")) {

      await subTask.delete();
      setSubTasks(subTasks.filter((possibleTask) => possibleTask.id !== subTask.id));

    }
    
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
            taskLists.map((taskList, index) => (
              <li key={taskList.id} className={styles.taskList}>
                <section>
                  <section>
                    <label>{taskList.name}</label>
                    <button onClick={async () => await taskList.delete()}>
                      <Icon name="delete" />
                    </button>
                  </section>
                  <input type="text" placeholder="Add a task..." value={newTaskNames[index] ?? ""} onChange={(event) => setNewTaskNamesFromIndex(index, event.target.value)} onKeyDown={async (event) => event.key === "Enter" ? await taskList.update({taskIds: [...taskList.taskIds, (await project.createTask({name: newTaskNames[index]})).id]}) : undefined} />
                </section>
                <ul id={styles.tasks}>
                  {
                    taskList.taskIds.map((taskId) => {

                      const subTask = subTasks.find((possibleTask) => possibleTask.id === taskId);
                      if (subTask) {

                        const status = project.statuses.find((status) => status.id === subTask.statusId);
                        return (
                          <li key={subTask.id}>
                            <span>
                              <span style={{color: `#${status?.textColor.toString(16)}`, backgroundColor: `#${status?.backgroundColor.toString(16)}`}}>{status?.name}</span>
                              <Link to={`/personal/projects/${project.id}/tasks/${subTask.id}`}>{subTask.name}</Link>
                            </span>
                            <button onClick={async () => await deleteSubTask(subTask)}>
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