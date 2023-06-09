import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Client from "../../client/Client";
import styles from "./SettingsPage.module.css";
import Project from "../../client/Project";
import Label from "../../client/Label";
import { useNavigate, useParams } from "react-router-dom";
import SettingsPageOption from "../SettingsPageOption/SettingsPageOption";

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

  useEffect(() => {

    if (project) {

      const onLabelCreate = (label: Label) => {

        setLabels((labels) => [...labels, label]);

      };

      const onLabelDelete = (labelId: string) => {

        setLabels((labels) => labels.filter((possibleLabel) => possibleLabel.id !== labelId));

      };

      client.addEventListener("labelCreate", onLabelCreate);
      client.addEventListener("labelDelete", onLabelDelete);
      
      return () => {
        
        client.removeEventListener("labelCreate", onLabelCreate);
        client.removeEventListener("labelDelete", onLabelDelete);

      };

    }

  }, [project]);

  const navigate = useNavigate();
  const [openOptions, setOpenOptions] = useState<{[key: string]: boolean}>({});

  return (
    <main id={styles.main}>
      <section id={styles.content}>
        <section id={styles.info}>
          <h1>Labels</h1>
          <p>You can use labels to organize your tasks. Labels are owned by your account rather than the project, so you can use them across projects if you would like.</p>
        </section>
        <section id={styles.listContainer}>
          <section>
            <button onClick={() => navigate(`${location.pathname}?create=label`)}>Create label</button>
          </section>
          <ul id={styles.list}>
            {
              labels.map((label) => (
                <SettingsPageOption key={label.id} isOpen={openOptions[label.id]} onToggle={(isOpen) => setOpenOptions({...openOptions, [label.id]: isOpen})} name={label.name}>
                  {label.description}
                  <span className={styles.labelActions}>
                    <button onClick={() => navigate(`${location.pathname}?edit=label&id=${label.id}`, {replace: true})}>Edit</button>
                    <button onClick={() => navigate(`${location.pathname}?remove=label&id=${label.id}`, {replace: true})}>Remove</button>
                  </span>
                </SettingsPageOption>
              ))
            }
          </ul>
        </section>
      </section>
    </main>
  );

}