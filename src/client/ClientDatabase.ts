import Dexie, { Table } from "dexie";
import { IssueProperties } from "./Issue.js";
import { LabelProperties } from "./Label.js";
import { ProjectProperties } from "./Project.js";

export class ClientDatabase extends Dexie {

  readonly issues!: Table<IssueProperties>;
  readonly labels!: Table<LabelProperties>;
  readonly projects!: Table<ProjectProperties>;

  constructor() {

    super("contents");
    this.version(1).stores({
      issues: "&id, name, description, status",
      labels: "&id, name, description",
      projects: "&id, name, description"
    });

  }

}

const db = new ClientDatabase();

export default db;