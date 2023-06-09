import React, { useEffect, useState } from "react";
import styles from "./Popup.module.css";
import Icon from "../Icon/Icon";

interface PopupProperties {
  name?: string;
  isOpen: boolean;
  onClose: () => void;
  maxWidth?: number;
  children: ReactNode;
}

export default function Popup({name, isOpen, onClose, maxWidth, children}: PopupProperties) {

  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {

    setIsShown(isOpen);

  }, [isOpen]);

  return (
    <section id={styles.popupContainer} className={isShown ? styles.open : undefined} onTransitionEnd={() => {
      
      if (!isShown) {

        onClose();

      }
    
    }}>
      <section id={styles.popup} style={maxWidth ? {
        "--popup-width-max": `${maxWidth}px` 
      } as React.CSSProperties : undefined}>
        <section id={styles.popupHeader}>
          {
            name ? (
              <span>{name}</span> 
            ) : null
          }
          <span id={styles.actions}>
            {/* <button>
              <Icon name="more_horiz" />
            </button> */}
            <button id={styles.closeButton} onClick={() => setIsShown(false)}>
              <Icon name="close" />
            </button>
          </span>
        </section>
        <section id={styles.popupContent}>
          {children}
        </section>
      </section>
    </section>
  );

}