import React, { useEffect, useState } from "react";
import styles from "./ColorInput.module.css";

const regex = /^([0-9A-F]{3}){1,2}$/i;

export default function ColorInput({hexCode, onChange, placeholder = ""}: {hexCode: string; onChange: (newHexCode: string, isValid: boolean) => void; placeholder?: string}) {

  const [isValid, setIsValid] = useState<boolean>(hexCode ? regex.test(hexCode) : true);

  useEffect(() => {
    
    setIsValid(hexCode ? regex.test(hexCode) : true);
    
  }, [hexCode]);

  return (
    <section className={styles.inputContainer}>
      <span className={styles.colorContainer}>
        <span className={styles.ball} style={(hexCode || placeholder) && isValid ? {backgroundColor: `#${hexCode || placeholder}`} : undefined} />
      </span>
      <input className={!isValid ? styles.invalid : undefined} type="text" value={hexCode ? `#${hexCode}` : ""} onChange={({target: {value}}) => {
        
        const valueHasHashtag = value.includes("#");
        const newHexCode = value.slice(valueHasHashtag ? 1 : 0, valueHasHashtag ? 7 : 6);
        onChange(newHexCode, newHexCode ? regex.test(newHexCode) : true);
      
      }} placeholder={`#${placeholder}`} />
    </section>
  );

}