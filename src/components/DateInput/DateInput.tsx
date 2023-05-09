import React from "react";
import styles from "./DateInput.module.css";

export default function DateInput({date = "", onChange}: {date?: string; onChange: (newDate: string) => void}) {

  return (
    <section className={styles.dateInputContainer}>
      {/* <button className={styles.toggleButton}>Choose a date</button>
      <section>
        <input type="text" />
      </section> */}
      <input type="date" value={date} onChange={({target: {value}}) => onChange(value)} />
    </section>
  );

}