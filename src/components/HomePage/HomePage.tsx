import React, { Dispatch, ReactElement, SetStateAction, useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { Link, useNavigate } from "react-router-dom";
import Client from "../../client/Client";

export default function HomePage({client, setDocumentTitle}: {client: Client; setDocumentTitle: Dispatch<SetStateAction<string>>}) {

  const navigate = useNavigate();

  useEffect(() => {

    setDocumentTitle("Home ▪ Planzea");
    document.title = "Home ▪ Planzea";

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
        <button onClick={() => navigate("?create=project", {replace: true})}>New project</button>
      </section>
      {
        ready ? (
          projectComponents[0] ? (
            <section>
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