import React, { useEffect, useRef, useState } from "react";
import styles from "./TaskPopup.module.css";
import Icon from "../Icon/Icon";
import Task from "../../client/Task";

export default function TaskPopup({task}: {task: Task | null}) {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {

    setIsOpen(true);

  }, []);

  const [doesTaskLackDescription, setDoesTaskLackDescription] = useState<boolean>(true);

  const descriptionRef = useRef<HTMLElement>(null);
  async function updateDescription() {

    const descriptionInput = descriptionRef.current;
    if (descriptionInput) {

      // Convert the description to Markdown.
      let newDescription = "";
      for (const element of descriptionInput.children) {

        // Add a line break, if necessary.
        if (newDescription.trim()) {

          newDescription += "\n";

        }

        // Determine the type of element we're on.
        switch (element.tagName) {

          case "P":
            newDescription += element.textContent;
            break;

          default:
            console.warn("Found an unknown tag while trying to convert description to Markdown. Skipping it.");
            break;

        }

      }

      // Save the new description.
      console.log(newDescription);
      // await task?.update({description: newDescription});

      // Update the description view.
      if (!newDescription) {

        setDoesTaskLackDescription(true);

      }

    }

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
              ref={descriptionRef}
              contentEditable 
              suppressContentEditableWarning
              onClick={() => setDoesTaskLackDescription(false)} 
              onBlur={updateDescription}>
              {
                doesTaskLackDescription ? (
                  <p id={styles.placeholder} placeholder="What's this task about?" />
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