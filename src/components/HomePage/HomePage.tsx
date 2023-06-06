import React from "react";
import Client from "../../client/Client";
import styles from "./HomePage.module.css";

export default function HomePage({client}: {client: Client}) {

  async function createProject() {

  }

  return (
    <main id={styles.main}>
      <section id={styles.noProjectsMessage}>
        <p>You don't have any projects yet. Want to change that?</p>
      </section>
    </main>
  );

}