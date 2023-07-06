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

export default function StatusManagementPage({client, project}: {client: Client; project: Project | null;}) {

  const [statuses, setStatuses] = useState<Status[]>([]);
  type NewStatusInfo = {
    name: string;
    color: string;
  };
  const [newValues, setNewValues] = useState<{[statusId: string]: NewStatusInfo}>({});
  
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
        setNewValues(newStatusInfo);
        setStatuses(statuses);

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

  return project ? (
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
            statuses.map((status, index) => {
              
              const isOnlyStatus = statuses.length === 1;
              const isDefaultStatus = index === 0;
              const statusNewValues = newValues[status.id];

              if (statusNewValues) {

                const { name, color } = statusNewValues;
                const setThisNewStatusInfo = (info: NewStatusInfo) => setNewValues((statusInfo) => {

                  const newStatusInfo = {...statusInfo};
                  newStatusInfo[status.id] = info;
                  return newStatusInfo;

                });

                const onMoveUp = !isDefaultStatus ? async () => {

                  const newStatusIds = [...project.statusIds];
                  newStatusIds.splice(index, 1);
                  newStatusIds.splice(index - 1, 0, status.id);
                  await project.update({statusIds: newStatusIds});

                } : undefined;

                const onMoveDown = status !== statuses[statuses.length - 1] ? async () => {

                  const newStatusIds = [...project.statusIds];
                  newStatusIds.splice(index, 1);
                  newStatusIds.splice(index + 1, 0, status.id);
                  await project.update({statusIds: newStatusIds});

                } : undefined;

                return (
                  <SettingsPageOption 
                    color={color ? `#${color}` : undefined} 
                    key={status.id} 
                    isOpen={openOptions[status.id]} 
                    onToggle={(isOpen) => setOpenOptions({...openOptions, [status.id]: isOpen})}
                    options={
                      <>
                        <button disabled={!onMoveUp} onClick={onMoveUp}>
                          <Icon name="arrow_upward" />
                        </button>
                        <button disabled={!onMoveDown} onClick={onMoveDown}>
                          <Icon name="arrow_downward" />
                        </button>
                      </>
                    }
                    name={
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
                      <input type="text" placeholder={status.name} value={name ?? ""} onChange={({target: {value: name}}) => setThisNewStatusInfo({name, color})} />
                    </section>
                    <FormSection name="Color">
                      <ColorInput hexCode={color ?? ""} onChange={(color) => setThisNewStatusInfo({name, color})} placeholder={color} />
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

              } 

              return null;

            })
          }
        </ul>
      </section>
    </section>
  ) : null;

}