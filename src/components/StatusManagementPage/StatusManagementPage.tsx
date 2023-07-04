import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Client from "../../client/Client";
import styles from "./StatusManagementPage.module.css";
import Project from "../../client/Project";
import { useNavigate } from "react-router-dom";
import SettingsPageOption from "../SettingsPageOption/SettingsPageOption";
import Status from "../../client/Status";
import Icon from "../Icon/Icon";

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
  const [newStatusInfo, setNewStatusInfo] = useState<{[statusId: string]: {
    name?: string;
    color?: string;
    description?: string;
  }}>({});

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
            statuses.map((status) => {
              
              const isOnlyStatus = statuses.length === 1;
              const isDefaultStatus = status === statuses[0];

              return (
                <SettingsPageOption key={status.id} isOpen={openOptions[status.id]} onToggle={(isOpen) => setOpenOptions({...openOptions, [status.id]: isOpen})} name={
                  <>
                    <span>
                      {status.name}
                    </span>
                    {
                      isDefaultStatus ? (
                        <span style={{marginLeft: "10px", backgroundColor: "var(--border)", padding: "0px 5px", borderRadius: "5px", boxShadow: "var(--box-shadow-default)"}}>
                          Default
                        </span>
                      ) : null
                    }
                  </>
                }>
                  {
                    isDefaultStatus ? (
                      <section className={"info"}>
                        <Icon name="info" />
                        <p>This is the default status because it's on the top of the list.</p>
                      </section>
                    ) : null
                  }
                  {
                    isOnlyStatus ? (
                      <section className={"warning"}>
                        <Icon name="warning" />
                        <p>You can't delete this status because it's the only one in this project.</p>
                      </section>
                    ) : null
                  }
                  <section>
                    <label>Name</label>
                    <input type="text" placeholder={status.name} value={newStatusInfo[status.id]?.name ?? ""} />
                  </section>
                  <section>
                    <label>Color</label>
                    <input type="text" placeholder="#ffffff" value={(newStatusInfo[status.id]?.color ?? status.color)?.toString(16) ?? ""} />
                  </section>
                  <span className={styles.labelActions}>
                    <button disabled>Save</button>
                    <button className="destructive" onClick={() => navigate(`?delete=status&id=${status.id}`, {replace: true})} disabled={isOnlyStatus}>Delete</button>
                  </span>
                </SettingsPageOption>
              );

            })
          }
        </ul>
      </section>
    </section>
  );

}