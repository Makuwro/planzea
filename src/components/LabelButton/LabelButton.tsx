import React from "react";
import styles from "./LabelButton.module.css";
import Label from "../../client/Label";
import Icon from "../Icon/Icon";

export default function LabelButton({label, onRemove}: {label: Label; onRemove: () => void}) {

  return (
    <li className={styles.label}>
      <button className={styles.colorBubble} onClick={onRemove}>
        <Icon name="close" />
      </button>
      <span>
        {label.name}
      </span>
    </li>
  )

}