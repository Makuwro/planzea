import React from "react";
import Icon from "../Icon/Icon";
import styles from "./BacklogViewModificationOptions.module.css";
import Project from "../../client/Project";

export default function BacklogViewModificationOptions({project}: {project: Project}) {

  return (
    <section id={styles.viewModificationOptions} onClick={async () => project.createTask({name: "Unnamed task"})}>
      <button id={styles.addIssueButton}>
        <Icon name="add" />
      </button>
      <span>
        <button>Group by: Nothing</button>
        <button>Sort by: Custom</button>
      </span>
    </section>
  );

}