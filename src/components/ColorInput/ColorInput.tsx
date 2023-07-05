import React, { useEffect, useState } from "react";
import styles from "./ColorInput.module.css";

export default function ColorInput({hexCode, onChange}: {hexCode: string; onChange: (newHexCode: string, isValid: boolean) => void}) {

  const [isValid, setIsValid] = useState<boolean>(hexCode ? /^([0-9A-F]{3}){1,2}$/i.test(hexCode) : true);

  useEffect(() => {
    
    setIsValid(hexCode ? /^([0-9A-F]{3}){1,2}$/i.test(hexCode) : true);
    
  }, [hexCode]);

  return (
    <section className={styles.inputContainer}>
      <span className={styles.colorContainer}>
        <span className={styles.ball} style={hexCode ? {backgroundColor: `#${hexCode}`} : undefined} />
      </span>
      <input className={!isValid ? styles.invalid : undefined} type="text" value={hexCode ? `#${hexCode}` : ""} onChange={({target: {value}}) => {
        
        const newHexCode = value.slice(hexCode ? 1 : 0, hexCode ? 7 : 6);
        console.log(newHexCode);
        onChange(newHexCode, newHexCode ? /^([0-9A-F]{3}){1,2}$/ig.test(newHexCode) : true);
      
      }} placeholder={"#000000"} />
    </section>
  );

}