import Dexie, { Table } from "dexie";
import { IssueProperties } from "./Issue.js";
import { LabelProperties } from "./Label.js";

export class ClientDatabase extends Dexie {

  issues!: Table<IssueProperties>;
  labels!: Table<LabelProperties>;

  constructor() {

    super("contents");
    this.version(1).stores({
      issues: "&id, name, description, status",
      labels: "&id, name, description"
    });

  }

}

const db = new ClientDatabase();

export default db;