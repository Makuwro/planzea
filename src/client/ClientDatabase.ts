import Dexie, { Table } from "dexie";
import { IssueProperties } from "./Issue.js";

export class ClientDatabase extends Dexie {

  issues!: Table<Omit<IssueProperties, "id"> & {id: string}>;

  constructor() {

    super("contents");
    this.version(1).stores({
      issues: "&id, name, description, status"
    });

  }

}

const db = new ClientDatabase();

export default db;