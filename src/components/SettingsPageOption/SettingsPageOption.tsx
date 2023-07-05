import React from "react";
import styles from "./SettingsPageOption.module.css";
import Icon from "../Icon/Icon";

export default function SettingsPageOption({name, isOpen, onToggle, color, children, options}: {color?: string; name: ReactNode; isOpen?: boolean; onToggle: (isOpen: boolean) => void; children: ReactNode; options?: ReactNode}) {

  return (
    <li className={styles.isOpen}>
      <section className={styles.labelBaseInfo}>
        <span>
          <span style={color ? {backgroundColor: color} : undefined} className={styles.labelColor} />
          <span>
            {name}
          </span>
        </span>
        <span className={styles.options}>
          {options}
          <button onClick={() => onToggle(!isOpen)}>
            <Icon name={`expand_${isOpen ? "less" : "more"}`} />
          </button>
        </span>
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