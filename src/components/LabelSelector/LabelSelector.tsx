import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Issue from "../../client/Issue";
import Label from "../../client/Label";
import Project from "../../client/Project";
import styles from "./LabelSelector.module.css";

export default function LabelSelector({isOpen, project, issue}: {isOpen: boolean, project: Project, issue: Issue}) {

  const [query, setQuery] = useState<string>("");
  const [listItemInfo, setListItemInfo] = useState<{isSelected: boolean, label: Label}[]>([]);
  const [labelComponents, setLabelComponents] = useState<React.ReactElement[]>([]);

  useEffect(() => {

    (async () => {

      const newListItemInfo = [];
      for (const label of await project.getLabels()) {

        newListItemInfo.push({
          isSelected: Boolean(issue.labels?.includes(label.id)),
          label
        });

      }

      setListItemInfo(newListItemInfo);

    })();

  }, [project]);

  useEffect(() => {

    async function toggleLabel(label: Label, remove: boolean) {

      // Update the label's issues.
      const labels = remove ? (issue.labels?.filter((labelId) => labelId !== label.id) || []) : [...(issue.labels ?? []), label.id];
      await issue.update({labels});

      // Update the checklist.
      const newList = [...listItemInfo];
      const listItem = newList.find((item) => item.label.id === label.id);
      if (listItem) {

        listItem.isSelected = !remove;

      }
      setListItemInfo(newList);

    }

    const newLabelComponents = [];
    for (const result of listItemInfo.filter((item) => !query || item.label.name.toLowerCase().includes(query.toLowerCase()))) {

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

  const navigate = useNavigate();

  return isOpen ? (
    <section id={styles.selector}>
      <section id={styles.header}>
        <section>
          <section id={styles.options}>
            <button onClick={() => navigate(`/${project.id}/issues/${issue.id}`)}>
              <span className="material-icons-round">
                arrow_back_ios
              </span>
            </button>
          </section>
          <ul id={styles.assignees}>
            <li>
              <button>
                <span className="material-icons-round">
                  person_add_alt
                </span>
              </button>
            </li>
          </ul>
        </section>
        <h1>Manage labels</h1>
      </section>
      <input type="text" value={query} placeholder="Label name" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} />
      <ul>
        {labelComponents}
      </ul>
    </section>
  ) : null;

}