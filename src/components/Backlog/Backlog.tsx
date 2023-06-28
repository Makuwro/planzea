import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./Backlog.module.css";
import BacklogTask from "../BacklogTask/BacklogTask";
import BacklogViewModificationOptions from "../BacklogViewModificationOptions/BacklogViewModificationOptions";
import Client from "../../client/Client";
import Project from "../../client/Project";
import Task from "../../client/Task";
import { useNavigate, useParams } from "react-router-dom";
import UIClient from "../../client/UIClient";

export default function Backlog({client, setCurrentProject, setDocumentTitle, uiClient}: {client: Client; setCurrentProject: (project: Project) => void; setDocumentTitle: Dispatch<SetStateAction<string>>; uiClient: UIClient}) {

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
        setDocumentTitle(project.name);
        uiClient.setCurrentProject(project);

      } else if (params.projectId) {

        const project = await client.getProject(params.projectId);
        if (project) {

          setProject(project);

        }

      } else if (client.personalProjectId) {

        setProject(await client.getProject(client.personalProjectId));

      }

    })();

    return () => {
      
      uiClient.setCurrentProject(null);
      uiClient.setSelectedTasks([]);

    };

  }, [project]);

  useEffect(() => {

    const onTaskCreate = (newTask: Task) => {

      if (project && newTask.projectId === project.id) {

        setTasks([...tasks, newTask]);

      }

    };

    const onTaskUpdate = (newTask: Task) => {

      const taskIndex = tasks.findIndex((possibleTask) => possibleTask.id === newTask.id);
      if (taskIndex !== -1) {

        const newTasks = [...tasks];
        newTasks[taskIndex] = newTask;
        setTasks(newTasks);

      }
      
    };

    const onTaskDelete = (taskId: string) => {

      setTasks(tasks.filter((possibleTask) => possibleTask.id !== taskId));
      uiClient.setSelectedTasks(uiClient.selectedTasks.filter((task) => task.id !== taskId));

    };

    client.addEventListener("taskCreate", onTaskCreate);
    client.addEventListener("taskUpdate", onTaskUpdate);
    client.addEventListener("taskDelete", onTaskDelete);

    return () => {
      
      client.removeEventListener("taskCreate", onTaskCreate);
      client.removeEventListener("taskUpdate", onTaskUpdate);
      client.removeEventListener("taskDelete", onTaskDelete);

    };


  }, [tasks, client, project]);

  const navigate = useNavigate();
  useEffect(() => {

    if (taskSelection && project) {

      if (taskSelectionPrevious && taskSelection.time - taskSelectionPrevious.time <= 500) {

        navigate(`/personal/projects/${project.id}/tasks/${taskSelection.task.id}`);

      }

      const verifyDeleteButton = async (event: KeyboardEvent) => {

        if (event.key === "Delete") {

          navigate(`${location.pathname}?delete=task&id=${taskSelection.task.id}`, {replace: true});

        }

      };

      window.addEventListener("keydown", verifyDeleteButton);
      
      return () => window.removeEventListener("keydown", verifyDeleteButton);

    }

  }, [taskSelection]);

  return project ? (
    <main id={styles.main}>
      <BacklogViewModificationOptions project={project} onTaskCreate={(task) => setTasks([...tasks, task])} selectedTask={taskSelection?.task} />
      {
        tasks[0] ? (
          <>
            <section id={styles.taskListContainer}>
              <ul id={styles.taskList}>
                {
                  tasks.filter((task) => !task.parentTaskId).map((task) => <BacklogTask key={task.id} task={task} project={project} isSelected={taskSelection?.task.id === task.id} onClick={() => {
                    
                    const newTaskSelection = {task, time: new Date().getTime()};
                    uiClient.setSelectedTasks([newTaskSelection.task]);
                    setTaskSelection(newTaskSelection);
                    setTaskSelectionPrevious(taskSelection);
                  
                  }} />)
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