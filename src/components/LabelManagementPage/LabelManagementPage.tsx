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

  type LabelFormInfo = {
    label: Label;
    newName: string;
    newColor: string;
    isOpen?: boolean;
    isColorValid?: boolean;
  };
  const [labelInfoGroup, setLabelInfoGroup] = useState<LabelFormInfo[] | null>([]);
  useEffect(() => {

    // Get all project labels.
    (async () => {

      if (project) {

        const labels = await project.getLabels();
        const newLabelInfo = [];
        for (const label of labels) {

          newLabelInfo.push({
            label,
            newName: label.name,
            newColor: label.color.toString(16),
            isColorValid: true
          });

        }
        setLabelInfoGroup(newLabelInfo);

      }

    })();

    if (project) {

      const onLabelCreate = (label: Label) => {

        setLabelInfoGroup((labelInfoGroup) => [...(labelInfoGroup ?? []), {
          label,
          newName: label.name,
          newColor: label.color.toString(16),
          isColorValid: true
        }]);

      };

      const onLabelDelete = (labelId: string) => {

        setLabelInfoGroup((labelInfoGroup) => labelInfoGroup && labelInfoGroup.filter((possibleLabelInfo) => possibleLabelInfo.label.id !== labelId));

      };

      const onLabelUpdate = (newLabel: Label) => {

        setLabelInfoGroup((labelInfoGroup) => labelInfoGroup && labelInfoGroup.map((labelInfo) => labelInfo.label.id === newLabel.id ? {
          label: newLabel,
          newName: newLabel.name,
          newColor: newLabel.color.toString(16),
          isOpen: labelInfo.isOpen,
          isColorValid: labelInfo.isColorValid
        } : labelInfo));

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

  return labelInfoGroup ? (
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
            labelInfoGroup.map((labelInfo, index) => {
              
              const {newName, newColor, label, isOpen, isColorValid} = labelInfo;
              const setThisNewValues = (info: LabelFormInfo) => {
                
                const newLabelInfoGroup = [...labelInfoGroup];
                newLabelInfoGroup.splice(index, 1, info);
                setLabelInfoGroup(newLabelInfoGroup);
                
              };

              return (
                <SettingsPageOption 
                  color={`#${newColor}`} 
                  key={label.id} 
                  isOpen={isOpen} 
                  onToggle={(isOpen) => setThisNewValues({newName, newColor, label, isOpen, isColorValid})} name={label.name}>
                  <FormSection name="Label name">
                    <input type="text" value={newName} placeholder={label.name} onChange={({target: {value: newName}}) => setThisNewValues({newName, newColor, label, isOpen, isColorValid})} />
                  </FormSection>
                  <FormSection name="Label color">
                    <ColorInput hexCode={newColor} onChange={(newColor, isColorValid) => setThisNewValues({newName, newColor, label, isOpen, isColorValid})} placeholder={label.color.toString(16)} />
                  </FormSection>
                  <span className={styles.labelActions}>
                    <button 
                      disabled={!isColorValid || ((!newName || newName === label.name) && (!newColor || parseInt(newColor, 16) === label.color))} 
                      onClick={async () => await label.update({
                        name: newName ?? label.name,
                        color: newColor ? parseInt(newColor, 16) : label.color
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