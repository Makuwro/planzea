import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import HeaderProjectSwitcher from "../HeaderProjectSwitcher/HeaderProjectSwitcher";
import Project from "../../client/Project";
import Client from "../../client/Client";
import Icon from "../Icon/Icon";

export default function Header({client, currentProject}: {client: Client; currentProject: Project | null}) {

  const [leftContainerWidth, setLeftContainerWidth] = useState<number>(195.43);
  const leftContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {

    window.addEventListener("resize", () => {

      if (leftContainerRef.current) {

        setLeftContainerWidth(leftContainerRef.current.getBoundingClientRect().width);

      }

    });

  }, []);

  return (
    <header style={{
      "--left-container-width": `${leftContainerWidth}px`
    } as React.CSSProperties}>
      <section id={styles.left} ref={leftContainerRef}>
        <Link to={"/"}>
          Planzea
        </Link>
        <HeaderProjectSwitcher client={client} currentProject={currentProject} />
      </section>
      <section id={styles.right}>
        <section>
          <button id={styles.searchButton}>
            <Icon name="search" />
          </button>
          <input type="text" placeholder="Search" />
        </section>
        <button id={styles.accountButton}>
          <span id={styles.nameContainer}>User</span>
          <span id={styles.avatarContainer}>
            
          </span>
        </button>
      </section>
    </header>
  );

}