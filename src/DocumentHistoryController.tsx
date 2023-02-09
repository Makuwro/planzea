import DocumentHistoryEntry, { DocumentHistoryEntryProperties } from "./DocumentHistoryEntry.js";

export default class DocumentHistoryController {

  history: DocumentHistoryEntry[] = [];
  position = 0;
  msBeforeNextEntry = 0;

  /**
   * Creates and adds an entry to the history array.
   * @param props Entry to add
   */
  createEntry(props: DocumentHistoryEntryProperties, forceNextEntry = false): DocumentHistoryEntry {

    let entry = this.history[this.position];
    if (forceNextEntry || !entry || entry.createdOn > this.msBeforeNextEntry) {

      if (this.position !== 0) {

        // Delete all previous entries.
        this.history.splice(0, this.position);
        this.position = 0;

      }

      entry = new DocumentHistoryEntry(props);
      this.history.unshift(entry);

    }

    return entry;

  }

  canMovePosition(steps: number): boolean {

    const newPosition = this.position + steps;
    return (steps > 0 && newPosition <= this.history.length - 1) || (steps < 0 && newPosition >= 0);

  }

  /**
   * 
   * @param steps 
   */
  movePosition(steps = 1): void {

    const newPosition = this.position + steps;
    if (this.canMovePosition(steps)) {

      const isUndoing = steps > 0;
      for (let i = this.position; newPosition > i; isUndoing ? i++ : i--) {

        this.history[newPosition].revert();
        this.position = newPosition;

      }

    }

  }

}