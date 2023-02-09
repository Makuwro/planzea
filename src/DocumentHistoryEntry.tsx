export type DocumentHistoryEntryName = "CharacterAdd" | "CharacterRemove" | "CharacterReplace" | "ParagraphAdd" | "ParagraphDelete";

export interface DocumentHistoryEntryProperties {
  name: DocumentHistoryEntryName;
  startContainer: Node;
  startOffset: number;
  endContainer: Node;
  endOffset: number;
}

export default class DocumentHistoryEntry {

  name: DocumentHistoryEntryName;
  createdOn = new Date().getTime();
  startContainer: Node;
  startOffset: number;
  endContainer: Node;
  endOffset: number;

  constructor(props: DocumentHistoryEntryProperties) {

    this.name = props.name;
    this.startContainer = props.startContainer;
    this.startOffset = props.startOffset;
    this.endContainer = props.endContainer;
    this.endOffset = props.endOffset;

  }

  revert(): void {

    // TODO: Implement this method

  }

}