import React, { useEffect, useState } from "react";
import Label from "../../client/Label";
import Project from "../../client/Project";

export default function LabelSelector({isOpen, project}: {isOpen: boolean, project: Project}) {

  const [query, setQuery] = useState<string>("");
  const [listItemInfo, setListItemInfo] = useState<{isSelected: boolean, label: Label}[]>([]);

  useEffect(() => {

    (async () => {

      const newListItemInfo = [];
      for (const label of await project.getLabels()) {

        newListItemInfo.push({
          isSelected: false,
          label
        });

      }

      setListItemInfo(newListItemInfo);

    })();

  }, [project]);

  useEffect(() => {

    

  }, [query]);

  return (
    <section>
      <input type="text" value={query} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} />
      <ul>
        <li>
          <button>
            Create new <b>{query}</b> label 
          </button>
        </li>
      </ul>
    </section>
  );

}