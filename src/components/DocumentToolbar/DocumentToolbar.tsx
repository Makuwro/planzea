import React, { useEffect, useState, ReactElement, ForwardedRef } from "react";
import DocumentHistoryController from "../../DocumentHistoryController.js";
import DocumentToolbarCategoryButton from "../DocumentToolbarCategoryButton/DocumentToolbarCategoryButton.js";
import DocumentToolbarSection from "../DocumentToolbarSection/DocumentToolbarSection.js";

export default function DocumentToolbar({editTime, contentContainerRef, historyController}: {editTime: number, contentContainerRef: ForwardedRef<HTMLElement>, historyController: DocumentHistoryController}) {

  const contentContainer = contentContainerRef && "current" in contentContainerRef ? contentContainerRef?.current : null;
  function getParentElement(node: Node, tagName: string, style?: {[key: string]: string}): HTMLElement | void {

    let element: HTMLElement | null = node as HTMLElement;
    while (element && element !== contentContainer) {

      if (element.tagName === tagName) {

        if (style) {

          const keys = Object.keys(style);
          let skip;
          for (const key of keys) {

            if (element.style[key as keyof CSSStyleDeclaration] !== style[key]) {

              skip = true;
              break;

            }

          }

          if (skip) {

            element = element?.parentElement;
            continue;

          }
          
        }

        return element;

      }

      element = element?.parentElement;

    }

  }

  const [currentRange, setCurrentRange] = useState<Range | null>(null);
  const [alignment, setAlignment] = useState<string>("left");
  const [isInContentContainer, setIsInContentContainer] = useState<boolean>(false);
  useEffect(() => {

    function checkSelection() {

      // Check if the new selection is in the content container.
      const selection = window.getSelection();
      const anchorNode = selection?.anchorNode;

      const isInContentContainer = anchorNode ? Boolean(contentContainer?.contains(anchorNode)) : false;
      // const isInFormatter = anchorNode ? formatterRef.current?.contains(anchorNode) : false;
      setIsInContentContainer(isInContentContainer);

      if (selection && isInContentContainer) {

        // Check if the selection is currently in the content container.
        const range = selection.getRangeAt(0);
        
        setCurrentRange(range);

        // Fix the alignment on the toolbar.
        if (getParentElement(range.startContainer, "P", {textAlign: "center"})) {

          setAlignment("center");

        } else if (getParentElement(range.startContainer, "P", {textAlign: "right"})) {

          setAlignment("right");

        } else if (getParentElement(range.startContainer, "P", {textAlign: "justify"})) {

          setAlignment("justify");

        } else {

          setAlignment("left");

        }

      }
      
    }

    document.addEventListener("selectionchange", checkSelection);

    return () => {

      document.removeEventListener("selectionchange", checkSelection);

    };

  }, [contentContainer]);

  function alignParagraph(alignment: "right" | "center" | "justify" | "" = "") {

    // Get the selection.
    const selection = window.getSelection();
    if (!selection || !contentContainer) return;

    // Let's get the start and end paragraphs.
    const {startContainer, endContainer} = selection.getRangeAt(0);
    const startParagraph = getParentElement(startContainer, "P");
    const endParagraph = getParentElement(endContainer, "P");
    const children = Array.from(contentContainer.children) as HTMLElement[];
    if (startParagraph && endParagraph) {

      const startIndex = children.indexOf(startParagraph);
      const endIndex = children.indexOf(endParagraph);

      // Iterate through the selected paragraphs and change their alignments.
      for (let i = startIndex; endIndex >= i; i++) {

        children[i].style.textAlign = alignment;

      }

      // Reset the selection.
      if (currentRange) {

        selection.removeAllRanges();
        selection.addRange(currentRange);

      }

    }

  }

  const toolbarStructure: {
    name: string;
    sections: {
      name: string;
      children: {
        name: string;
        onClick: () => void;
      }[]
    }[]
  }[] = [
    {
      name: "File",
      sections: [
        {
          name: "Export",
          children: [
            {
              name: "Print",
              onClick: () => print()
            }
          ]
        }
      ]
    },
    {
      name: "Edit",
      sections: [
        {
          name: "Select",
          children: [
            {
              name: "Select all",
              onClick: () => {

                if (contentContainer) {

                  const range = document.createRange();
                  range.selectNodeContents(contentContainer);
                  const selection = window.getSelection();
                  selection?.removeAllRanges();
                  selection?.addRange(range);

                }

              }
            }
          ]
        }
      ]
    },
    {
      name: "Format",
      sections: [
        {
          name: "Alignment",
          children: [
            {
              name: "Left",
              onClick: () => alignParagraph()
            },
            {
              name: "Center",
              onClick: () => alignParagraph("center")
            },
            {
              name: "Right",
              onClick: () => alignParagraph("right")
            },
            {
              name: "Justify",
              onClick: () => alignParagraph("justify")
            }
          ]
        }
      ]
    },
    {
      name: "View",
      sections: [
        {
          name: "Editor",
          children: [
            {
              name: "Edit time",
              onClick: () => {

                const seconds = Math.floor((editTime / 1000) % 60);
                const minutes = Math.floor((editTime / (1000 * 60)) % 60);
                const hours = Math.floor((editTime / (1000 * 60 * 60)) % 24);
                const useComma = seconds && minutes;

                alert(`${hours ? `${hours} hours${useComma ? ", " : (seconds || minutes ? " and " : "")}` : ""}${minutes ? `${minutes} minutes${useComma ? ", and " : (seconds ? " and " : "")}` : ""}${seconds || (!hours && !minutes) ? `${seconds} seconds` : ""}`);

              }
            },
            {
              name: "Word count",
              onClick: () => alert(`${contentContainer?.textContent?.trim().split(/\s+/).length ?? 0} words`)
            }
          ]
        }
      ]
    }
  ];

  const [categorySelectorComponents, setCategorySelectorComponents] = useState<ReactElement[]>([]);
  const [categorySectionComponents, setCategorySectionComponents] = useState<ReactElement[]>([]);

  useEffect(() => {

    const newCategorySelectorComponents = [];
    const newCategorySectionComponents = [];
    for (const category of toolbarStructure) {

      newCategorySelectorComponents.push(
        <DocumentToolbarCategoryButton key={category.name}>
          {category.name}
        </DocumentToolbarCategoryButton>
      );
      
      const sections = [];
      for (const section of category.sections) {
        
        const buttons = section.children.map((button) => (
          <li key={button.name}>
            <button onClick={button.onClick}>
              {button.name}
            </button>
          </li>
        ));

        sections.push(
          <DocumentToolbarSection name={section.name} key={section.name}>
            {buttons}
          </DocumentToolbarSection>
        );

      }

      newCategorySectionComponents.push(
        <section key={category.name}>
          {sections}
        </section>
      );

    }

    setCategorySelectorComponents(newCategorySelectorComponents);
    setCategorySectionComponents(newCategorySectionComponents);

  }, [editTime, contentContainer]);

  return (
    <section>
      <ul>
        {categorySelectorComponents}
      </ul>
      {categorySectionComponents}
    </section>
  );

}