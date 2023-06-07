import React from "react";
import Client from "../../client/Client";
import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";

export default function HomePage({client}: {client: Client}) {

  const navigate = useNavigate();

  return (
    <main id={styles.main}>
      <section id={styles.options}>
        <button onClick={() => navigate("?create=project")}>Create project</button>
      </section>
      <section id={styles.noProjectsMessage}>
        <p>You don't have any projects yet. Want to change that?</p>
      </section>
    </main>
  );

}