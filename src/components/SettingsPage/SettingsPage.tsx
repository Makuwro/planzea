import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Client from "../../client/Client";
import styles from "./SettingsPage.module.css";
import Icon from "../Icon/Icon";
import Project from "../../client/Project";
import Label from "../../client/Label";
import { useNavigate, useParams } from "react-router-dom";

export default function SettingsPage({client, project, setCurrentProject, setDocumentTitle}: {client: Client; project: Project | null; setCurrentProject: Dispatch<SetStateAction<Project | null>>; setDocumentTitle: Dispatch<SetStateAction<string>>}) {

  const [labels, setLabels] = useState<Label[]>([]);
  const params = useParams<{projectId: string}>();
  useEffect(() => {

    (async () => {

      if (project) {

        setLabels(await project.getLabels());
        setDocumentTitle(`Labels ▪ ${project.name} ▪ Planzea`);
        document.title = `Labels ▪ ${project.name} ▪ Planzea`;

      } else if (params.projectId) {

        const project = await client.getProject(params.projectId);
        setCurrentProject(project);

      }

    })();

  }, [project]);

  const navigate = useNavigate();

  return (
    <main id={styles.main}>
      <section id={styles.info}>
        <h1>Labels</h1>
        <p>You can use labels to organize your tasks.</p>
      </section>
      <section id={styles.listContainer}>
        <section>
          <button onClick={() => navigate(`${location.pathname}?create=label`)}>Create label</button>
        </section>
        <ul id={styles.list}>
          {
            labels.map((label) => (
              <li key={label.id}>
                <section className={styles.labelBaseInfo}>
                  <b>{label.name}</b>
                  <button>
                    <Icon name="expand_more" />
                  </button>
                </section>
                <section className={styles.labelDescription}>
                  {label.description}
                  <span>
                    <button>Edit</button>
                    <button>Delete</button>
                  </span>
                </section>
              </li>
            ))
          }
        </ul>
      </section>
    </main>
  );

}