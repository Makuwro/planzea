import React from "react";
import styles from "./FormSection.module.css";

interface FormSectionProperties {
  name?: string;
  hint?: string;
  children: ReactNode;
}

export default function FormSection({name, hint, children}: FormSectionProperties) {

  return (
    <section>
      <label>{name}</label>
      {
        hint ? (
          <p className={styles.hint}>
            {hint}
          </p>
        ) : null
      }
      {children}    
    </section>
  );

}