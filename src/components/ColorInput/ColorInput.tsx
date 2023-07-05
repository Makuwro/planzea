import React, { useEffect, useState } from "react";
import styles from "./ColorInput.module.css";

export default function ColorInput({hexCode, onChange, placeholder = ""}: {hexCode: string; onChange: (newHexCode: string, isValid: boolean) => void; placeholder?: string}) {

  const regex = /^([0-9A-F]{3}){1,2}$/ig;
  const [isValid, setIsValid] = useState<boolean>(hexCode ? regex.test(hexCode) : true);

  useEffect(() => {
    
    setIsValid(hexCode || placeholder ? regex.test(hexCode || placeholder) : true);
    
  }, [hexCode, placeholder]);

  return (
    <section className={styles.inputContainer}>
      <span className={styles.colorContainer}>
        <span className={styles.ball} style={(hexCode || placeholder) && isValid ? {backgroundColor: `#${hexCode || placeholder}`} : undefined} />
      </span>
      <input className={!isValid ? styles.invalid : undefined} type="text" value={hexCode ? `#${hexCode}` : ""} onChange={({target: {value}}) => {
        
        const newHexCode = value.slice(hexCode ? 1 : 0, hexCode ? 7 : 6);
        onChange(newHexCode, newHexCode ? regex.test(newHexCode) : true);
      
      }} placeholder={`#${placeholder}`} />
    </section>
  );

}