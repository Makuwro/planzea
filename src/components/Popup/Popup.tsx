import React, { ReactElement, RefObject, useEffect, useRef, useState } from "react";
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
  popupContentPadding?: number;
}

export default function Popup({name, isOpen, onClose, maxWidth, children, actions, popupContainerRef, popupContentPadding}: PopupProperties) {

  const [isShown, setIsShown] = useState<boolean>(false);
  const [isBackgroundMouseDown, setIsBackgroundMouseDown] = useState<boolean>(false);

  useEffect(() => {

    setIsShown(isOpen);

  }, [isOpen]);

  const stopPropagation = (event: React.MouseEvent) => event.stopPropagation();

  const ref = popupContainerRef ?? useRef<HTMLElement>(null);

  return (
    <section ref={ref} onMouseDown={() => setIsBackgroundMouseDown(true)} onMouseUp={(event) => isBackgroundMouseDown && event.target === ref?.current ? setIsShown(false) : setIsBackgroundMouseDown(false)} id={styles.popupContainer} className={isShown ? styles.open : undefined} onTransitionEnd={() => {
      
      if (!isShown) {

        onClose();

      }
    
    }}>
      <section id={styles.popup} style={maxWidth ? {
        "--popup-width-max": `${maxWidth}px`
      } as React.CSSProperties : undefined} onMouseDown={stopPropagation} onMouseUp={stopPropagation}>
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
        <section id={styles.popupContent} style={popupContentPadding !== undefined ? {padding: popupContentPadding} : undefined}>
          {children}
        </section>
      </section>
    </section>
  );

}