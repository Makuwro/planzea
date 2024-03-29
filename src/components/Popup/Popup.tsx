import React, { ReactElement, RefObject, useEffect, useState } from "react";
import styles from "./Popup.module.css";
import Icon from "../Icon/Icon";

interface PopupProperties {
  actions?: ReactElement;
  name?: string;
  isOpen: boolean;
  onClose: () => void;
  maxWidth?: number;
  children: ReactNode;
  popupContainerRef?: RefObject<HTMLElement>;
}

export default function Popup({name, isOpen, onClose, maxWidth, children, actions, popupContainerRef}: PopupProperties) {

  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {

    setIsShown(isOpen);

  }, [isOpen]);

  return (
    <section ref={popupContainerRef} id={styles.popupContainer} className={isShown ? styles.open : undefined} onTransitionEnd={() => {
      
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
            {actions}
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