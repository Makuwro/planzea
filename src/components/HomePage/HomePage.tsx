import React, { ReactElement, useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { Link, useNavigate } from "react-router-dom";
import Client from "../../client/Client";
import Icon from "../Icon/Icon";
import { SetState } from "../../App";
import Project from "../../client/Project";
import ProjectHeaderOptions from "../ProjectHeaderOptions/ProjectHeaderOptions";
import ProjectListButton from "../ProjectListButton/ProjectListButton";

export default function HomePage({client, setDocumentTitle, setCurrentProject}: {client: Client; setDocumentTitle: SetState<string>; setCurrentProject: SetState<Project | null>}) {

  const navigate = useNavigate();

  useEffect(() => {

    setDocumentTitle("Projects");
    setCurrentProject(null);

  }, []);

  const [projects, setProjects] = useState<Project[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  useEffect(() => {

    (async () => {

      setProjects(await client.getProjects());
      setReady(true);

    })();

  }, []);

  return (
    <main id={styles.main}>
      <ProjectHeaderOptions />
      {
        ready ? (
          projects[0] ? (
            <section id={styles.projectListContainer}>
              <ul id={styles.projectList}>
                {
                  projects.map((project) => <ProjectListButton key={project.id} project={project} isSelected={false} onClick={() => undefined} />)
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