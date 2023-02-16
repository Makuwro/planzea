import React, { useEffect, useState } from "react";
import Client from "../../client/Client";
import Label from "../../client/Label";
import Project from "../../client/Project";
import styles from "./LabelSelector.module.css";

export default function LabelSelector({client, isOpen, project}: {client: Client, isOpen: boolean, project: Project}) {

  const [query, setQuery] = useState<string>("");
  const [listItemInfo, setListItemInfo] = useState<{isSelected: boolean, label: Label}[]>([]);
  const [labelComponents, setLabelComponents] = useState<React.ReactElement[]>([]);

  useEffect(() => {

    (async () => {

      const newListItemInfo = [];
      const projectLabels = (await project.getLabels()).map((label) => label.id);
      for (const label of await client.getLabels()) {

        newListItemInfo.push({
          isSelected: projectLabels.includes(label.id),
          label
        });

      }

      setListItemInfo(newListItemInfo);

    })();

  }, [project]);

  useEffect(() => {

    async function toggleLabel(label: Label, remove: boolean) {

      // Update the label's projects.
      const projects = remove ? (label.projects?.filter((projectId) => projectId !== project.id) || []) : [...(label.projects ?? []), project.id];
      await label.update({projects});

      // Update the checklist.
      const newList = [...listItemInfo];
      const listItem = newList.find((item) => item.label.id === label.id);
      if (listItem) {

        listItem.isSelected = !remove;

      }
      setListItemInfo(newList);

    }

    const newLabelComponents = [];
    for (const result of listItemInfo.filter((item) => !query || item.label.name.includes(query))) {

      newLabelComponents.push(
        <li key={result.label.id}>
          <button className={styles.option} onClick={() => toggleLabel(result.label, result.isSelected)}>
            <span className={`${styles.circle} ${result.isSelected ? styles.selected : ""} material-icons-round`}>
              check
            </span>
            <span>
              {result.label.name}
            </span>
          </button>
        </li>
      );
      
    }
    setLabelComponents(newLabelComponents);

  }, [listItemInfo, query]);

  async function createLabel() {

    const label = await project.createLabel({name: query});
    setListItemInfo([...listItemInfo, {isSelected: true, label}]);

  }

  return (
    <section id={styles.selector}>
      <input type="text" value={query} placeholder="Label name" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} />
      <ul>
        <li>
          <button disabled={!query} onClick={createLabel}>
            Create new <b>{query}</b> label 
          </button>
        </li>
        {labelComponents}
      </ul>
    </section>
  );

}