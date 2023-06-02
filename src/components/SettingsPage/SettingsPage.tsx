import React, { useEffect, useState } from "react";
import Client from "../../client/Client";
import styles from "./SettingsPage.module.css";
import Icon from "../Icon/Icon";
import Project from "../../client/Project";
import Label from "../../client/Label";

export default function SettingsPage({client, project}: {client: Client; project: Project}) {

  const [labels, setLabels] = useState<Label[]>([]);
  useEffect(() => {

    (async () => {

      setLabels(await project.getLabels());

    })();

  }, [project]);

  return (
    <main id={styles.main}>
      <section id={styles.info}>
        <h1>Labels</h1>
        <p>You can use labels to organize your tasks.</p>
      </section>
      <section id={styles.listContainer}>
        <section>
          <button>Create label</button>
        </section>
        <ul id={styles.list}>
          {
            labels.map((label) => (
              <li key={label.id}>
                <section className={styles.labelBaseInfo}>
                  <b>{label.name}</b>
                  <button>
                    <Icon name="expand_more" />
                  </button>
                </section>
                <section className={styles.labelDescription}>
                  {label.description}
                  <span>
                    <button>Edit</button>
                    <button>Delete</button>
                  </span>
                </section>
              </li>
            ))
          }
        </ul>
      </section>
    </main>
  );

}