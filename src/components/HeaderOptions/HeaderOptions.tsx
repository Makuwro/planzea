import React from "react";
import styles from "./HeaderOptions.module.css";

export default function HeaderOptions({children}: {children: ReactNode}) {

  return (
    <section id={styles.options}>
      {children}
    </section>
  );

}