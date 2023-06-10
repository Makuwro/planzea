import React, { useEffect, useRef } from "react";
import styles from "./ContextMenu.module.css";

export interface ContextMenuOption {
  label: ReactNode;
  onClick: () => void;
}

interface ContextMenuProperties {
  isOpen: boolean; 
  onOutsideClick: () => void;
  options: ContextMenuOption[]; 
  triggerElement?: HTMLElement | null;
}

export default function ContextMenu({isOpen, options, onOutsideClick, triggerElement}: ContextMenuProperties) {

  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {

    const checkForOutsideClick = (event: MouseEvent) => {

      if (event.target && !menuRef.current?.contains(event.target as Node) && (!triggerElement || !triggerElement.contains(event.target as Node))) {

        onOutsideClick();

      }

    };

    if (isOpen) {

      window.addEventListener("click", checkForOutsideClick);

    }

    return () => window.removeEventListener("click", checkForOutsideClick);

  }, [isOpen]);

  return (
    <section className={`${styles.menuContainer}${isOpen ? ` ${styles.open}` : ""}`}>
      <section className={styles.menu} ref={menuRef}>
        <ul>
          {
            options.map((option, index) => (
              <li key={index}>
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