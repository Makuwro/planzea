import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Issue from "../../client/Issue";
import Project from "../../client/Project";
import Icon from "../Icon/Icon";
import styles from "./TaskSection.module.css";

export default function TaskSection({project, issue}: {project: Project, issue: Issue}) {

  const [newTaskName, setNewTaskName] = useState<string>("");
  const [tasks, setTasks] = useState<Issue[]>([]);

  async function createTask(event: React.KeyboardEvent) {

    if (event.key === "Enter") {

      const task = await project.createIssue({
        parentIssueId: issue.id,
        name: newTaskName
      });

      setTasks([...tasks, task]);
      setNewTaskName("");

    }

  }

  useEffect(() => {

    (async () => {

      setTasks((await project.getIssues()).filter((task) => task.parentIssueId === issue.id));

    })();

  }, [project, issue]);

  async function deleteTask(task: Issue) {

    if (confirm("Are you sure you want to delete this task?")) {

      await task.delete();
      setTasks(tasks.filter((possibleTask) => possibleTask.id !== task.id));

    }
    
  }
  
  return (
    <section>
      <label>Tasks</label>
      <section style={{marginTop: "16px"}}>
        <input type="text" placeholder="Add a task..." value={newTaskName} onChange={(event) => setNewTaskName(event.target.value)} onKeyDown={createTask} />
        <ul id={styles.tasks}>
          {
            tasks.map((task) => {

              const status = project.statuses.find((status) => status.id === task.statusId);
              return (
                <li key={task.id}>
                  <span>
                    <span style={{color: `#${status?.textColor.toString(16)}`, backgroundColor: `#${status?.backgroundColor.toString(16)}`}}>{status?.name}</span>
                    <Link to={`/${project.id}/issues/${task.id}`}>{task.name}</Link>
                  </span>
                  <button onClick={async () => await deleteTask(task)}>
                    <Icon name="close" />
                  </button>
                </li>
              );

            })
          }
        </ul>
      </section>
    </section>
  );

}