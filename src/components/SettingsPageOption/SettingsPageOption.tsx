import React from "react";
import styles from "./SettingsPageOption.module.css";
import Icon from "../Icon/Icon";

export default function SettingsPageOption({name, isOpen, onToggle, children}: {name: ReactNode; isOpen?: boolean; onToggle: (isOpen: boolean) => void; children: ReactNode}) {

  return (
    <li className={styles.isOpen}>
      <section className={styles.labelBaseInfo}>
        <span>
          <span className={styles.labelColor} />
          <span>
            {name}
          </span>
        </span>
        <button onClick={() => onToggle(!isOpen)}>
          <Icon name={`expand_${isOpen ? "less" : "more"}`} />
        </button>
      </section>
      {
        isOpen ? (
          <section className={styles.labelDescription}>
            {children}
          </section>
        ) : null
      }
      
    </li>
  );

}