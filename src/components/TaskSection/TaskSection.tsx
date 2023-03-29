import React, { useEffect, useState } from "react";
import Issue from "../../client/Issue";
import Project from "../../client/Project";

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

    }

  }

  useEffect(() => {

    (async () => {

      setTasks((await project.getIssues()).filter((task) => task.parentIssueId === issue.id));

    })();

  }, [project, issue]);
  
  return (
    <section>
      <label>Tasks</label>
      <section>
        <input type="text" placeholder="Add a task..." value={newTaskName} onChange={(event) => setNewTaskName(event.target.value)} onKeyDown={createTask} />
        <ul>
          {
            tasks.map((task) => (
              <li key={task.id}>
                <button>{task.name}</button>
              </li>
            ))
          }
        </ul>
      </section>
    </section>
  );

}