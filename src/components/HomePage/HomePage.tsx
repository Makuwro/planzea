import React, { useEffect } from "react";
import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";

export default function HomePage({setDocumentTitle}: {setDocumentTitle: (title: string) => void}) {

  const navigate = useNavigate();

  useEffect(() => {

    setDocumentTitle("Home ▪ Planzea");
    document.title = "Home ▪ Planzea";

  }, []);

  return (
    <main id={styles.main}>
      <section id={styles.options}>
        <button onClick={() => navigate("?create=project", {replace: true})}>New project</button>
      </section>
      <section id={styles.noProjectsMessage}>
        <p>You don't have any projects yet. Want to change that?</p>
      </section>
    </main>
  );

}