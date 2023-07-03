import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Client from "../../client/Client";
import styles from "./StatusManagementPage.module.css";
import Project from "../../client/Project";
import { useNavigate } from "react-router-dom";
import SettingsPageOption from "../SettingsPageOption/SettingsPageOption";
import Status from "../../client/Status";

export default function StatusManagementPage({client, project, setDocumentTitle}: {client: Client; project: Project | null; setDocumentTitle: Dispatch<SetStateAction<string>>}) {

  const [statuses, setStatuses] = useState<Status[]>([]);
  useEffect(() => {

    (async () => {

      if (project) {

        setStatuses(await project.getStatuses());
        setDocumentTitle(`Statuses ▪ ${project.name} project settings`);

      }

    })();

  }, [project]);

  useEffect(() => {

    if (project) {

      const onLabelCreate = (status: Status) => {

        setStatuses((statuses) => [...statuses, status]);

      };

      const onLabelDelete = (statusId: string) => {

        setStatuses((statuses) => statuses.filter((possibleStatus) => possibleStatus.id !== statusId));

      };

      const onLabelUpdate = (newStatus: Status) => {

        setStatuses((statuses) => statuses.map((status) => status.id === newStatus.id ? newStatus : status));

      };

      client.addEventListener("statusCreate", onLabelCreate);
      client.addEventListener("statusDelete", onLabelDelete);
      client.addEventListener("statusUpdate", onLabelUpdate);
      
      return () => {
        
        client.removeEventListener("statusCreate", onLabelCreate);
        client.removeEventListener("statusDelete", onLabelDelete);
        client.removeEventListener("statusUpdate", onLabelUpdate);

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
            statuses.map((status) => (
              <SettingsPageOption key={status.id} isOpen={openOptions[status.id]} onToggle={(isOpen) => setOpenOptions({...openOptions, [status.id]: isOpen})} name={status.name}>
                {status.description}
                <span className={styles.labelActions}>
                  <button onClick={() => navigate(`?edit=status&id=${status.id}`, {replace: true})}>Edit</button>
                  <button onClick={() => navigate(`?remove=status&id=${status.id}`, {replace: true})}>Remove</button>
                </span>
              </SettingsPageOption>
            ))
          }
        </ul>
      </section>
    </section>
  );

}