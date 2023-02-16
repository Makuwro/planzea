import React, { useEffect, useState } from "react";
import Label from "../../client/Label";
import Project from "../../client/Project";
import styles from "./LabelSelector.module.css";

export default function LabelSelector({isOpen, project}: {isOpen: boolean, project: Project}) {

  const [query, setQuery] = useState<string>("");
  const [listItemInfo, setListItemInfo] = useState<{isSelected: boolean, label: Label}[]>([]);
  const [labelComponents, setLabelComponents] = useState<React.ReactElement[]>([]);

  useEffect(() => {

    (async () => {

      const newListItemInfo = [];
      for (const label of await project.getLabels()) {

        newListItemInfo.push({
          isSelected: false,
          label
        });

      }

      setListItemInfo(newListItemInfo);

    })();

  }, [project]);

  useEffect(() => {

    const newLabelComponents = [];
    for (const result of listItemInfo.filter((item) => !query || item.label.name.includes(query))) {

      newLabelComponents.push(
        <li key={result.label.id}>
          <button>
            {result.label.name}
          </button>
        </li>
      );
      
    }
    setLabelComponents(newLabelComponents);

  }, [listItemInfo, query]);

  async function createLabel() {

    

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