import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Client from "../../client/Client";
import styles from "./StatusManagementPage.module.css";
import Project from "../../client/Project";
import Label from "../../client/Label";
import { useNavigate } from "react-router-dom";
import SettingsPageOption from "../SettingsPageOption/SettingsPageOption";

export default function StatusManagementPage({client, project, setDocumentTitle}: {client: Client; project: Project | null; setDocumentTitle: Dispatch<SetStateAction<string>>}) {

  const [labels, setLabels] = useState<Label[]>([]);
  useEffect(() => {

    (async () => {

      if (project) {

        setLabels(await project.getLabels());
        setDocumentTitle(`Statuses ▪ ${project.name} project settings`);

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

      const onLabelUpdate = (newLabel: Label) => {

        setLabels((labels) => labels.map((label) => label.id === newLabel.id ? newLabel : label));

      };

      client.addEventListener("labelCreate", onLabelCreate);
      client.addEventListener("labelDelete", onLabelDelete);
      client.addEventListener("labelUpdate", onLabelUpdate);
      
      return () => {
        
        client.removeEventListener("labelCreate", onLabelCreate);
        client.removeEventListener("labelDelete", onLabelDelete);
        client.removeEventListener("labelUpdate", onLabelUpdate);

      };

    }

  }, [project]);

  const navigate = useNavigate();
  const [openOptions, setOpenOptions] = useState<{[key: string]: boolean}>({});

  return (
    <section id={styles.content}>
      <section id={styles.info}>
        <h1>Statuses</h1>
        <p>How close are you to finishing the task? You can find out with statuses.</p>
      </section>
      <section id={styles.listContainer}>
        <section>
          <button onClick={() => navigate("?create=status")}>Create status</button>
        </section>
        <ul id={styles.list}>
          {
            labels.map((label) => (
              <SettingsPageOption key={label.id} isOpen={openOptions[label.id]} onToggle={(isOpen) => setOpenOptions({...openOptions, [label.id]: isOpen})} name={label.name}>
                {label.description}
                <span className={styles.labelActions}>
                  <button onClick={() => navigate(`?edit=label&id=${label.id}`, {replace: true})}>Edit</button>
                  <button onClick={() => navigate(`?remove=label&id=${label.id}`, {replace: true})}>Remove</button>
                </span>
              </SettingsPageOption>
            ))
          }
        </ul>
      </section>
    </section>
  );

}