import React, { useEffect, useState } from "react";
import Label from "../../client/Label";
import Icon from "../Icon/Icon";
import Client from "../../client/Client";
import { useNavigate } from "react-router-dom";

export interface LabelInputComponentProperties {
  client: Client;
  taskId?: string;
  labelIds: string[];
  onChange: (labelIds: string[]) => void;
}

export default function LabelInput({client, taskId, labelIds, onChange}: LabelInputComponentProperties) {

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

  const navigate = useNavigate();
  return (
    <section>
      <section>
        {
          labels[0] ? (
            <ul>
              {
                labels.map((label) => (
                  <li key={label.id}>
                    <button onClick={() => onChange(labelIds.filter((possibleId) => possibleId !== label.id))}>
                      <Icon name="close" />
                    </button>
                    <span>
                      {label.name}
                    </span>
                  </li>
                ))
              }
            </ul>
          ) : null
        }
        <input type="text" value={labelQuery} onChange={({target: {value}}) => setLabelQuery(value)} placeholder="Add a label..." />
      </section>
      {
        results ? (
          <ul>
            {
              results.map((label) => (
                <li key={label.id}>
                  <button onClick={() => {
                    
                    onChange([...labelIds, label.id]);
                    setLabelQuery("");
                  
                  }}>
                    <span />
                    <span>
                      {label.name}
                    </span>
                  </button>
                </li>
              ))
            }
            <li>
              <button onClick={() => navigate(`${location.pathname}?create=label&name=${labelQuery}${taskId ? `&taskId=${taskId}` : ""}`)}>
                <b>Create new label:</b> {labelQuery}
              </button>
            </li>
          </ul>
        ) : null
      }
    </section>
  );

}