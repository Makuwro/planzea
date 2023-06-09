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

      setSubTasks((await project.getTasks()).filter((subTask) => subTask.parentTaskId === task.id));

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
      <label>Sub-tasks</label>
      <section>
        <input type="text" placeholder="Add a task..." value={newTaskName} onChange={(event) => setNewTaskName(event.target.value)} onKeyDown={createTask} />
        {
          subTasks[0] ? (
            <ul id={styles.tasks}>
              {
                subTasks.map((subTask) => {

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

                })
              }
            </ul>
          ) : null
        }
      </section>
    </section>
  );

}