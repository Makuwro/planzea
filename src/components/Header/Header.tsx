import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import HeaderProjectSwitcher from "../HeaderProjectSwitcher/HeaderProjectSwitcher";
import Search from "../Search/Search";
import CacheClient from "../../client/CacheClient";

export default function Header({client}: {client: CacheClient}) {

  const [leftContainerWidth, setLeftContainerWidth] = useState<number>(195.43);
  const leftContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {

    window.addEventListener("resize", () => {

      if (leftContainerRef.current) {

        setLeftContainerWidth(leftContainerRef.current.getBoundingClientRect().width);

      }

    });

  }, []);

  const [isMobileSearching, setIsMobileSearching] = useState<boolean>(false);

  return (
    <header className={isMobileSearching ? styles.mobileSearching : undefined} style={{
      "--left-container-width": `${leftContainerWidth}px`
    } as React.CSSProperties}>
      <section id={styles.left} ref={leftContainerRef}>
        <Link to={"/"}>
          Planzea
        </Link>
        <HeaderProjectSwitcher client={client} />
      </section>
      <section id={styles.right}>
        <Search client={client} onMobileSearchChange={(isMobileSearching) => setIsMobileSearching(isMobileSearching)} />
        <button id={styles.accountButton}>
          <span id={styles.nameContainer}>User</span>
          <span id={styles.avatarContainer}>
            
          </span>
        </button>
      </section>
    </header>
  );

}