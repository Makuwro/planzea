import React, { useEffect, useState } from "react";
import styles from "./TaskPopup.module.css";
import Icon from "../Icon/Icon";
import Task from "../../client/Task";

export default function TaskPopup({task}: {task: Task | null}) {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {

    setIsOpen(true);

  }, []);

  const [doesTaskLackDescription, setDoesTaskLackDescription] = useState<boolean>(true);

  function updateDescription() {

    

  }

  return (
    <section id={styles.popupContainer} className={isOpen ? styles.open : undefined}>
      <section id={styles.popup}>
        <section id={styles.popupHeader}>
          <label>Project Name</label>
          <span id={styles.actions}>
            <button>
              <Icon name="more_horiz" />
            </button>
            <button id={styles.closeButton}>
              <Icon name="close" />
            </button>
          </span>
        </section>
        <section id={styles.popupContent}>
          <h1>Give collaborators access to the GitHub repository</h1>
          <nav>
            <button className={styles.selected}>Details</button>
            <button>Activity</button>
          </nav>
          <section id={styles.details}>
            <section 
              id={styles.description} 
              contentEditable 
              suppressContentEditableWarning>
              {
                doesTaskLackDescription ? (
                  <p id={styles.placeholder} onClick={() => setDoesTaskLackDescription(false)} placeholder="This task doesn't have a description." />
                ) : null
              }
              <p>
                <br />
              </p>
            </section>
            <section>
              <label>Labels</label>
              <p>This task doesn't have any labels.</p>
            </section>
          </section>
        </section>
      </section>
    </section>
  );

}