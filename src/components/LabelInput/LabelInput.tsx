import React, { useEffect, useRef, useState } from "react";
import Label from "../../client/Label";
import Icon from "../Icon/Icon";
import Client from "../../client/Client";
import { useNavigate } from "react-router-dom";
import styles from "./LabelInput.module.css";
import { createPortal } from "react-dom";

export interface LabelInputComponentProperties {
  client: Client;
  taskId?: string;
  labelIds: string[];
  onChange: (labelIds: string[]) => void;
  resultsContainer?: HTMLElement;
}

export default function LabelInput({client, taskId, labelIds, onChange, resultsContainer}: LabelInputComponentProperties) {

  // Get the labels from the label IDs.
  const [labels, setLabels] = useState<Label[]>([]);
  useEffect(() => {

    (async () => {
      
      const labels = [];
      for (const labelId of labelIds) {
        
        labels.push(await client.getLabel(labelId));

      }

      setLabels(labels);
      
    })();

  }, [labelIds]);
  
  // Get the current project labels.
  const [projectLabels, setProjectLabels] = useState<Label[]>([]);
  useEffect(() => {

    (async () => {

      setProjectLabels(await client.getLabels());

    })();

    const onLabelCreate = (label: Label) => {

      setProjectLabels([...projectLabels, label]);
      setLabelQuery("");

    };

    client.addEventListener("labelCreate", onLabelCreate);

    return () => client.removeEventListener("labelCreate", onLabelCreate);

  }, []);

  // Search for labels.
  const [labelQuery, setLabelQuery] = useState<string>("");
  const [results, setResults] = useState<Label[] | null>(null);
  useEffect(() => {

    (async () => {

      if (labelQuery) {

        setResults(projectLabels.filter((possibleLabel) => !labelIds.find((possibleLabelId) => possibleLabelId === possibleLabel.id) && possibleLabel.name.match(new RegExp(labelQuery, "i"))));

      } else {

        setResults(null);

      }

    })();

  }, [projectLabels, labelQuery]);

  const [top, setTop] = useState<number>(0);
  const [maxWidth] = useState<number>(1080 - 30); // width - padding
  const inputContainerRef = useRef<HTMLElement>(null);
  useEffect(() => {

    const fixTop = () => {

      if (inputContainerRef.current && resultsContainer) {

        const rect = inputContainerRef.current.getBoundingClientRect();
        setTop(rect.top + rect.height);

      }

    };

    fixTop();
    window.addEventListener("resize", fixTop);
    return () => window.removeEventListener("resize", fixTop);

  }, [results, resultsContainer]);

  const navigate = useNavigate();
  const resultsComponent = results ? (
    <ul className={styles.results} style={resultsContainer ? {top, maxWidth} : undefined}>
      {
        results.map((label) => (
          <li key={label.id}>
            <button onClick={() => {
              
              onChange([...labelIds, label.id]);
              setLabelQuery("");
            
            }}>
              <span className={styles.colorBubble} />
              <span>
                {label.name}
              </span>
            </button>
          </li>
        ))
      }
      <li>
        <button onClick={() => navigate(`${location.pathname}?create=label&name=${labelQuery}${taskId ? `&taskId=${taskId}` : ""}`)}>
          <Icon name="add" />
          <span>
            <b>Create new label: </b>
            <span>
              {labelQuery}
            </span>
          </span>
        </button>
      </li>
    </ul>
  ) : null;

  return (
    <section ref={inputContainerRef} className={styles.inputSuperContainer}>
      <section className={styles.inputContainer}>
        <ul>
          {
            labels.map((label) => (
              <li key={label.id} className={styles.label}>
                <button className={styles.colorBubble} onClick={() => onChange(labelIds.filter((possibleId) => possibleId !== label.id))}>
                  <Icon name="close" />
                </button>
                <span>
                  {label.name}
                </span>
              </li>
            ))
          }
          <li>
            <input type="text" value={labelQuery} onKeyDown={(event) => {

              if (event.key === "Backspace" && !labelQuery && labels[0]) {

                const newLabelIds = [...labelIds];
                newLabelIds.pop();
                onChange(newLabelIds);

              }

            }} onChange={({target: {value}}) => setLabelQuery(value)} placeholder="Add a label..." />
          </li>
        </ul>
      </section>
      {resultsContainer ? createPortal(resultsComponent, resultsContainer) : resultsComponent}
    </section>
  );

}