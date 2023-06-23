import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import HeaderProjectSwitcher from "../HeaderProjectSwitcher/HeaderProjectSwitcher";
import Project from "../../client/Project";
import Client from "../../client/Client";

export default function Header({client, currentProject}: {client: Client; currentProject: Project | null}) {

  return (
    <header>
      <section id={styles.left}>
        <Link to={"/"}>
          Planzea
        </Link>
        <HeaderProjectSwitcher client={client} currentProject={currentProject} />
      </section>
      <section id={styles.right}>
        <button id={styles.accountButton}>
          <span id={styles.nameContainer}>User</span>
          <span id={styles.avatarContainer}>
            
          </span>
        </button>
      </section>
    </header>
  );

}