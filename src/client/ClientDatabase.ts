import Dexie, { Table } from "dexie";
import { AttachmentProperties } from "./Attachment.js";
import { TaskProperties } from "./Task.js";
import { LabelProperties } from "./Label.js";
import { ProjectProperties } from "./Project.js";

export class ClientDatabase extends Dexie {

  readonly attachments!: Table<AttachmentProperties>;
  readonly tasks!: Table<TaskProperties>;
  readonly labels!: Table<LabelProperties>;
  readonly projects!: Table<ProjectProperties>;

  constructor() {

    super("contents");
    this.version(1).stores({
      attachments: "&id, name, description, issueIds",
      tasks: "&id, name, description, status",
      labels: "&id, name, description",
      projects: "&id, name, description"
    });

  }

}

const db = new ClientDatabase();

export default db;