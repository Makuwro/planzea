import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Project from "../../client/Project";
import Icon from "../Icon/Icon";
import styles from "./TaskPopupSubTaskSection.module.css";
import Task from "../../client/Task";

export default function TaskPopupSubTaskSection({project, task}: {project: Project, task: Task}) {

  const [newTaskNames, setNewTaskNames] = useState<string[]>([]);
  const [subTasks, setSubTasks] = useState<Task[]>([]);

  const setNewTaskNamesFromIndex = (index: number, value: string) => {

    const newNames = [...newTaskNames];
    newNames[index] = value;
    setNewTaskNames(newNames);

  };

  async function createTask(index: number) {

    // Make sure the task list exists.
    const taskLists = task.taskLists;
    const taskList = taskLists?.[index];
    if (taskList) {

      // Create a new task and and add it to the task list.
      const subtask = await project.createTask({name: newTaskNames[index]});
      taskList.taskIds.push(subtask.id);

      // Update the task lists.
      taskLists.splice(taskLists.indexOf(taskList), 1, taskList);
      await task.update({taskLists});

    }

  }

  useEffect(() => {

    (async () => {

      setNewTaskNames([]);
      setSubTasks((await project.getTasks()).filter((possibleSubTask) => task.taskLists?.find((taskList) => taskList.taskIds.includes(possibleSubTask.id))));

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
          async () => await task.update({taskLists: [...(task.taskLists ?? []), {
            name: "Tasks",
            taskIds: []
          }]})
        }>Create task list</button>
      </section>
      {
        task.taskLists?.[0] ? (
          task.taskLists.map((list, index) => (
            <section key={index}>
              <label>{list.name}</label>
              <input type="text" placeholder="Add a task..." value={newTaskNames[index] ?? ""} onChange={(event) => setNewTaskNamesFromIndex(index, event.target.value)} onKeyDown={(event) => event.key === "Enter" ? createTask(index) : undefined} />
              <ul id={styles.tasks}>
                {
                  list.taskIds.map((taskId) => {

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
            </section>
          ))
        ) : null
      }
    </section>
  );

}