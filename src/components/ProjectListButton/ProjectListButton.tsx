import React, { useState } from "react";
import Project from "../../client/Project";
import Icon from "../Icon/Icon";
import styles from "./ProjectListButton.module.css";

export default function ProjectListButton({project, isSelected, onClick}: {project: Project; isSelected: boolean; onClick: () => void}) {

  // Keep track of touch times.
  const [touchStartTime, setTouchStartTime] = useState<number>(0);

  return (
    <li>
      <section className={`${styles.project}${isSelected ? ` ${styles.selected}` : ""}`} onClick={onClick} onTouchStart={() => setTouchStartTime(new Date().getTime())} onTouchEnd={() => {

        const touchEndTime = new Date().getTime();

        if (touchEndTime - touchStartTime <= 500) {

          onClick();
          onClick();

        }

        setTouchStartTime(0);

      }}>
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