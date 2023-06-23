import React, { ReactElement, useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { Link, useNavigate } from "react-router-dom";
import Client from "../../client/Client";
import Icon from "../Icon/Icon";
import { SetState } from "../../App";
import Project from "../../client/Project";

export default function HomePage({client, setDocumentTitle, setCurrentProject}: {client: Client; setDocumentTitle: SetState<string>; setCurrentProject: SetState<Project | null>}) {

  const navigate = useNavigate();

  useEffect(() => {

    setDocumentTitle("Projects");
    setCurrentProject(null);

  }, []);

  const [projectComponents, setProjectComponents] = useState<ReactElement[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  useEffect(() => {

    (async () => {

      const comps = [];
      for (const project of await client.getProjects()) {

        comps.push(
          <li key={project.id}>
            <Link to={`/personal/projects/${project.id}/`}>
              {project.name}
            </Link>
          </li>
        );

      }
      setProjectComponents(comps);
      setReady(true);

    })();

  }, []);

  return (
    <main id={styles.main}>
      <section id={styles.options}>
        <button onClick={() => navigate("?create=project", {replace: true})}>
          <Icon name="add" />
        </button>
      </section>
      {
        ready ? (
          projectComponents[0] ? (
            <section id={styles.projectListContainer}>
              <ul>
                {projectComponents}
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