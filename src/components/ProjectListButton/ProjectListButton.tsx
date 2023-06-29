import React from "react";
import Project from "../../client/Project";
import Icon from "../Icon/Icon";
import styles from "./ProjectListButton.module.css";

export default function ProjectListButton({project, isSelected, onClick}: {project: Project; isSelected: boolean; onClick: () => void}) {

  return (
    <li>
      <section className={`${styles.project}${isSelected ? ` ${styles.selected}` : ""}`} onClick={onClick}>
        <span>
          <Icon name="folder" />
          <span>
            {project.name}
          </span>
        </span>
      </section>
    </li>
  );

}