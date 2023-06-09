import React, { useEffect, useRef, useState } from "react";
import styles from "./ContextMenu.module.css";

export interface ContextMenuOption {
  label: ReactNode;
  onClick: () => void;
}

export default function ContextMenu({isOpen, options, onOutsideClick}: {isOpen: boolean; options: ContextMenuOption[]; onOutsideClick: () => void}) {

  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {

    const checkForOutsideClick = (event: MouseEvent) => {

      // TODO: Exclude trigger/opening button
      if (event.target && !menuRef.current?.contains(event.target as Node)) {

        onOutsideClick();

      }

    };

    window.addEventListener("click", checkForOutsideClick);

    return () => window.removeEventListener("click", checkForOutsideClick);

  }, []);

  return (
    <section className={`${styles.menuContainer}${isOpen ? ` ${styles.open}` : ""}`}>
      <section className={styles.menu} ref={menuRef}>
        <ul>
          {
            options.map((option) => (
              <li key={option.onClick.toString()}>
                <button onClick={option.onClick}>
                  {option.label}
                </button>
              </li>
            ))
          }
        </ul>
      </section>
    </section>
  );

}