import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./Backlog.module.css";
import BacklogTask from "../BacklogTask/BacklogTask";
import BacklogViewModificationOptions from "../BacklogViewModificationOptions/BacklogViewModificationOptions";
import Client from "../../client/Client";
import Project from "../../client/Project";
import Task from "../../client/Task";
import { useNavigate, useParams } from "react-router-dom";

export default function Backlog({client, setCurrentProject, setDocumentTitle}: {client: Client; setCurrentProject: (project: Project) => void; setDocumentTitle: Dispatch<SetStateAction<string>>}) {

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskSelection, setTaskSelection] = useState<{task: Task; time: number} | null>(null);
  const [taskSelectionPrevious, setTaskSelectionPrevious] = useState<{task: Task; time: number} | null>(null);
  const params = useParams<{projectId: string}>();

  useEffect(() => {

    (async () => {

      if (project) {

        setTasks(await project.getTasks());
        setCurrentProject(project);
        setDocumentTitle(`${project.name} ▪ Planzea`);
        document.title = `${project.name} ▪ Planzea`;

      } else if (params.projectId) {

        const project = await client.getProject(params.projectId);
        if (project) {

          setProject(project);

        }

      } else if (client.personalProjectId) {

        setProject(await client.getProject(client.personalProjectId));

      }

    })();

  }, [project]);

  useEffect(() => {

    const onTaskUpdate = (newTask: Task) => {

      const taskIndex = tasks.findIndex((possibleTask) => possibleTask.id === newTask.id);
      if (taskIndex !== -1) {

        const newTasks = [...tasks];
        newTasks[taskIndex] = newTask;
        setTasks(newTasks);

      }
      
    };

    client.addEventListener("taskUpdate", onTaskUpdate);

    return () => client.removeEventListener("taskUpdate", onTaskUpdate);


  }, [tasks, client]);

  const deleteTask = async (task: Task) => {

    if (confirm("Are you sure you want to delete this task?")) {

      await task.delete();
      setTasks(tasks.filter((possibleTask) => possibleTask.id !== task.id));
      setTaskSelection(null);

    }

  };

  const navigate = useNavigate();
  useEffect(() => {

    if (taskSelection && project) {

      if (taskSelectionPrevious && taskSelection.time - taskSelectionPrevious.time <= 500) {

        navigate(`/personal/projects/${project.id}/tasks/${taskSelection.task.id}`);

      }

      const verifyDeleteButton = async (event: KeyboardEvent) => {

        if (event.key === "Delete") {

          await deleteTask(taskSelection.task);

        }

      };

      window.addEventListener("keydown", verifyDeleteButton);
      
      return () => window.removeEventListener("keydown", verifyDeleteButton);

    }

  }, [taskSelection]);

  return project ? (
    <main id={styles.main}>
      <BacklogViewModificationOptions project={project} onTaskCreate={(task) => setTasks([...tasks, task])} />
      {
        tasks[0] ? (
          <>
            <section id={styles.taskListContainer}>
              <ul id={styles.taskList}>
                {
                  tasks.filter((task) => !task.parentTaskId).map((task) => <BacklogTask client={client} key={task.id} task={task} project={project} isSelected={taskSelection?.task.id === task.id} onClick={() => {
                    
                    const newTaskSelection = {task, time: new Date().getTime()};
                    setTaskSelection(newTaskSelection);
                    setTaskSelectionPrevious(taskSelection);
                  
                  }} onDelete={async () => await deleteTask(task)} onUpdate={(newTask) => setTasks(tasks.map((task) => task.id === newTask.id ? newTask : task))} />)
                }
              </ul>
            </section>
          </>
        ) : (
          <section id={styles.noTasksMessage}>
            <h1>That's a wrap!</h1>
            <p>You don't have any more tasks. Good job!</p>
          </section>
        )
      }
    </main>
  ) : null;

}