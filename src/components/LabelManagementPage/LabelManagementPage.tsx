import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Client from "../../client/Client";
import styles from "./LabelManagementPage.module.css";
import Project from "../../client/Project";
import Label from "../../client/Label";
import { useNavigate } from "react-router-dom";
import SettingsPageOption from "../SettingsPageOption/SettingsPageOption";
import FormSection from "../FormSection/FormSection";
import ColorInput from "../ColorInput/ColorInput";

export default function LabelManagementPage({client, project, setDocumentTitle}: {client: Client; project: Project | null; setDocumentTitle: Dispatch<SetStateAction<string>>}) {

  const [labels, setLabels] = useState<Label[]>([]);
  useEffect(() => {

    (async () => {

      if (project) {

        setLabels(await project.getLabels());
        setDocumentTitle(`Labels ▪ ${project.name} settings`);

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

  const [hex, setHex] = useState<{code: string; isValid: boolean}>({code: "", isValid: true});

  return (
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
            labels.map((label) => (
              <SettingsPageOption key={label.id} isOpen={openOptions[label.id]} onToggle={(isOpen) => setOpenOptions({...openOptions, [label.id]: isOpen})} name={label.name}>
                <FormSection name="Label name">
                  <input type="text" />
                </FormSection>
                <FormSection name="Label color">
                  <ColorInput hexCode={hex.code} onChange={(code, isValid) => setHex({code, isValid})} />
                </FormSection>
                <span className={styles.labelActions}>
                  <button disabled onClick={() => navigate(`?remove=label&id=${label.id}`, {replace: true})}>Save</button>
                  <button className="destructive" onClick={() => navigate(`?remove=label&id=${label.id}`, {replace: true})}>Remove</button>
                </span>
              </SettingsPageOption>
            ))
          }
        </ul>
      </section>
    </section>
  );

}