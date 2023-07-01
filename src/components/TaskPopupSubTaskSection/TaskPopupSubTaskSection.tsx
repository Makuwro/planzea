import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Project from "../../client/Project";
import Icon from "../Icon/Icon";
import styles from "./TaskPopupSubTaskSection.module.css";
import Task from "../../client/Task";

export default function TaskPopupSubTaskSection({project, task}: {project: Project, task: Task}) {

  const [newTaskName, setNewTaskName] = useState<string>("");
  const [subTasks, setSubTasks] = useState<Task[]>([]);

  async function createTask(event: React.KeyboardEvent) {

    if (event.key === "Enter") {

      const subtask = await project.createTask({
        parentTaskId: task.id,
        name: newTaskName
      });

      setSubTasks([...subTasks, subtask]);
      setNewTaskName("");

    }

  }

  useEffect(() => {

    (async () => {

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
          <>
            <section>
              <input type="checkbox" disabled />
              <label>Hide this task from the backlog</label>
            </section>
            {
              task.taskLists.map((list, index) => (
                <section key={index}>
                  <label>{list.name}</label>
                  <input type="text" placeholder="Add a task..." value={newTaskName} onChange={(event) => setNewTaskName(event.target.value)} onKeyDown={createTask} />
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
            }
          </>
        ) : null
      }
    </section>
  );

}