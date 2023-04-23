import React, { ComponentPropsWithoutRef } from "react";
import styles from "./Popup.module.css";

export default function Popup({isOpen, children, className, ...props}: {isOpen: boolean, children: ReactNode} & ComponentPropsWithoutRef<"section">) {

  return (
    <section id={styles.background} className={isOpen ? `${styles.open} ${className ?? ""}` : undefined} {...props}>
      <section id={styles.popup}>
        {children}
      </section>
    </section>
  );

}