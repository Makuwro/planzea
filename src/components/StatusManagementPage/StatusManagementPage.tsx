import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Client from "../../client/Client";
import styles from "./StatusManagementPage.module.css";
import Project from "../../client/Project";
import { useNavigate } from "react-router-dom";
import SettingsPageOption from "../SettingsPageOption/SettingsPageOption";
import Status from "../../client/Status";
import Icon from "../Icon/Icon";
import FormSection from "../FormSection/FormSection";
import ColorInput from "../ColorInput/ColorInput";

export default function StatusManagementPage({client, project, setDocumentTitle}: {client: Client; project: Project | null; setDocumentTitle: Dispatch<SetStateAction<string>>}) {

  const [statuses, setStatuses] = useState<Status[]>([]);
  type NewStatusInfo = {
    name: string;
    color: string;
  };
  const [newStatusInfo, setNewStatusInfo] = useState<{[statusId: string]: NewStatusInfo}>({});
  useEffect(() => {

    (async () => {

      if (project) {

        const statuses = await project.getStatuses();
        const newStatusInfo: {[statusId: string]: NewStatusInfo} = {};
        for (const status of statuses) {

          const color = status.color.toString(16);
          newStatusInfo[status.id] = {
            name: status.name,
            color
          };

        }
        setNewStatusInfo(newStatusInfo);
        setStatuses(statuses);
        setDocumentTitle(`Statuses ▪ ${project.name} project settings`);

      }

    })();

    if (project) {

      const onStatusCreate = (status: Status) => {

        setStatuses((statuses) => [...statuses, status]);

      };

      const onStatusDelete = (statusId: string) => {

        setStatuses((statuses) => statuses.filter((possibleStatus) => possibleStatus.id !== statusId));

      };

      const onStatusUpdate = (newStatus: Status) => {

        setStatuses((statuses) => statuses.map((status) => status.id === newStatus.id ? newStatus : status));

      };

      client.addEventListener("statusCreate", onStatusCreate);
      client.addEventListener("statusDelete", onStatusDelete);
      client.addEventListener("statusUpdate", onStatusUpdate);
      
      return () => {
        
        client.removeEventListener("statusCreate", onStatusCreate);
        client.removeEventListener("statusDelete", onStatusDelete);
        client.removeEventListener("statusUpdate", onStatusUpdate);

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
            statuses.map((status) => {
              
              const isOnlyStatus = statuses.length === 1;
              const isDefaultStatus = status === statuses[0];
              const thisNewStatusInfo = newStatusInfo[status.id];
              const setThisNewStatusInfo = (info: NewStatusInfo) => setNewStatusInfo((statusInfo) => {

                const newStatusInfo = {...statusInfo};
                newStatusInfo[status.id] = info;
                return newStatusInfo;

              });
              const { name, color } = newStatusInfo[status.id];

              return (
                <SettingsPageOption color={color ? `#${color}` : undefined} key={status.id} isOpen={openOptions[status.id]} onToggle={(isOpen) => setOpenOptions({...openOptions, [status.id]: isOpen})} name={
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
                    <input type="text" placeholder={status.name} value={thisNewStatusInfo.name ?? ""} />
                  </section>
                  <FormSection name="Color">
                    <ColorInput hexCode={color ?? ""} onChange={(color) => setThisNewStatusInfo({...thisNewStatusInfo, color})} placeholder={color} />
                  </FormSection>
                  <span className={styles.labelActions}>
                    <button disabled={name === status.name && color !== undefined && parseInt(color, 16) === status.color} onClick={async () => await status.update({
                      name: name || status.name,
                      color: color ? parseInt(color, 16) : status.color
                    })}>Save</button>
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