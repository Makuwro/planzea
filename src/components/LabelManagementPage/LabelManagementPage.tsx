import React, { useEffect, useState } from "react";
import Client from "../../client/Client";
import styles from "./LabelManagementPage.module.css";
import Project from "../../client/Project";
import Label from "../../client/Label";
import { useNavigate } from "react-router-dom";
import SettingsPageOption from "../SettingsPageOption/SettingsPageOption";
import FormSection from "../FormSection/FormSection";
import ColorInput from "../ColorInput/ColorInput";

export default function LabelManagementPage({client, project}: {client: Client; project: Project | null;}) {

  const [labels, setLabels] = useState<Label[]>([]);
  type NewLabelInfo = {
    name: string;
    color: string;
  };
  const [newValues, setNewValues] = useState<{[labelId: string]: NewLabelInfo} | null>(null);
  useEffect(() => {

    // Get all project labels.
    (async () => {

      if (project) {

        const labels = await project.getLabels();
        const newLabelInfo: {[labelId: string]: NewLabelInfo} = {};
        for (const label of labels) {

          const color = label.color.toString(16);
          newLabelInfo[label.id] = {
            name: label.name,
            color
          };

        }
        setNewValues(newLabelInfo);
        setLabels(labels);

      }

    })();

    if (project) {

      const onLabelCreate = (label: Label) => {

        setLabels((labels) => [...labels, label]);
        setNewValues(null);

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

  }, [project, labels]);

  const navigate = useNavigate();
  const [openOptions, setOpenOptions] = useState<{[key: string]: boolean}>({});

  return newValues ? (
    <section id={styles.content}>
      <section id={styles.info}>
        <h1>Labels</h1>
        <p>You can use labels to organize your tasks. Labels are owned by your account rather than the project, so you can use them across projects if you would like.</p>
      </section>
      <section id={styles.listContainer}>
        <section>
          <button onClick={() => navigate("?create=label")}>Create label</button>
        </section>
        <ul id={styles.list}>
          {
            labels.map((label) => {
              
              const {name, color} = newValues[label.id];
              const setThisNewValues = (info: NewLabelInfo) => setNewValues((newValues) => ({...newValues, [label.id]: info}));

              return (
                <SettingsPageOption 
                  color={color ? `#${color}` : undefined} 
                  key={label.id} 
                  isOpen={openOptions[label.id]} 
                  onToggle={(isOpen) => setOpenOptions({...openOptions, [label.id]: isOpen})} name={label.name}>
                  <FormSection name="Label name">
                    <input type="text" value={name} placeholder={label.name} onChange={({target: {value: name}}) => setThisNewValues({name, color})} />
                  </FormSection>
                  <FormSection name="Label color">
                    <ColorInput hexCode={color} onChange={(color, isValid) => setThisNewValues({name, color})} />
                  </FormSection>
                  <span className={styles.labelActions}>
                    <button 
                      disabled={name === label.name && color !== undefined && parseInt(color, 16) === label.color} 
                      onClick={async () => await label.update({
                        name: name ?? label.color,
                        color: color ? parseInt(color, 16) : label.color
                      })}>
                      Save
                    </button>
                    <button className="destructive" onClick={() => navigate(`?delete=label&id=${label.id}`, {replace: true})}>
                      Delete
                    </button>
                  </span>
                </SettingsPageOption>
              );

            })
          }
        </ul>
      </section>
    </section>
  ) : null;

}