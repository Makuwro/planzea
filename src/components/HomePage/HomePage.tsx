import React, { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { SetState } from "../../App";
import Project from "../../client/Project";
import ProjectHeaderOptions from "../ProjectHeaderOptions/ProjectHeaderOptions";
import ProjectListButton from "../ProjectListButton/ProjectListButton";
import CacheClient from "../../client/CacheClient";
import { useNavigate } from "react-router-dom";

interface ProjectSelection {
  project: Project; 
  time: number;
}

export default function HomePage({client, setDocumentTitle}: {client: CacheClient; setDocumentTitle: SetState<string>;}) {

  useEffect(() => {

    setDocumentTitle("Projects");

  }, []);

  const [projects, setProjects] = useState<Project[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  useEffect(() => {

    (async () => {

      setProjects(await client.getProjects());
      setReady(true);

    })();

    const onProjectCreate = (project: Project) => {

      setProjects([...projects, project]);

    };

    const onProjectUpdate = (project: Project) => {

      const taskIndex = projects.findIndex((possibleProject) => possibleProject.id === project.id);
      if (taskIndex !== -1) {

        const newProjects = [...projects];
        newProjects[taskIndex] = project;
        setProjects(newProjects);

      }
      
    };

    const onProjectDelete = (projectId: string) => {

      const projectFilter = (possibleProject: Project) => possibleProject.id !== projectId;
      setProjects(projects.filter(projectFilter));
      client.setSelectedProjects(client.selectedProjects.filter(projectFilter));

    };

    client.addEventListener("projectCreate", onProjectCreate);
    client.addEventListener("projectUpdate", onProjectUpdate);
    client.addEventListener("projectDelete", onProjectDelete);

    return () => {
      
      client.removeEventListener("projectCreate", onProjectCreate);
      client.removeEventListener("projectUpdate", onProjectUpdate);
      client.removeEventListener("projectDelete", onProjectDelete);
      client.setSelectedProjects([]);

    };


  }, [client]);

  const [projectSelection, setProjectSelection] = useState<ProjectSelection | null>(null);
  const [projectSelectionPrevious, setProjectSelectionPrevious] = useState<ProjectSelection | null>(null);
  const navigate = useNavigate();
  useEffect(() => {

    if (projectSelection) {
      
      if (projectSelectionPrevious && projectSelection.time - projectSelectionPrevious.time <= 500) {

        navigate(`/personal/projects/${projectSelection.project.id}/tasks`);

      } else {

        client.setSelectedProjects([projectSelection.project]);

      }

    } else {

      client.setSelectedProjects([]);

    }

  }, [projectSelection]);

  return (
    <main id={styles.main}>
      <ProjectHeaderOptions projectId={projectSelection?.project.id} />
      {
        ready ? (
          projects[0] ? (
            <section id={styles.projectListContainer}>
              <ul id={styles.projectList}>
                {
                  projects.map((project) => <ProjectListButton key={project.id} project={project} isSelected={projectSelection?.project.id === project.id} onClick={() => {
                    
                    setProjectSelectionPrevious(projectSelection);
                    setProjectSelection({project, time: new Date().getTime()});
                  
                  }} />)
                }
              </ul>
            </section>
          ) : (
            <section id={styles.noProjectsMessage}>
              <p>You don't have any projects yet. Want to change that?</p>
            </section>
          )
        ) : null
      }
    </main>
  );

}