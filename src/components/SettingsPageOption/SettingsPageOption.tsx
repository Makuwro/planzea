import React from "react";
import styles from "./SettingsPageOption.module.css";
import Icon from "../Icon/Icon";

export default function SettingsPageOption({name, isOpen, onToggle, color, children}: {color?: string; name: ReactNode; isOpen?: boolean; onToggle: (isOpen: boolean) => void; children: ReactNode}) {

  return (
    <li className={styles.isOpen}>
      <section className={styles.labelBaseInfo}>
        <span>
          <span style={color ? {backgroundColor: color} : undefined} className={styles.labelColor} />
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
          <form className={styles.labelDescription}>
            {children}
          </form>
        ) : null
      }
      
    </li>
  );

}