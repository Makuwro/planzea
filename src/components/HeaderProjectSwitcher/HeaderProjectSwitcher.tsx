import React from "react";
import Icon from "../Icon/Icon";
import styles from "./HeaderProjectSwticher.module.css";
import Project from "../../client/Project";

export default function HeaderProjectSwitcher({currentProject}: {currentProject: Project | null}) {

  return (
    <button id={styles.button}>
      <Icon name="home" />
      <span id={styles.name}>{currentProject?.name ?? "Home"}</span>
    </button>
  );

}