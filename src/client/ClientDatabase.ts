import Dexie, { Table } from "dexie";
import { AttachmentProperties } from "./Attachment.js";
import { TaskProperties } from "./Task.js";
import { LabelProperties } from "./Label.js";
import { ProjectProperties } from "./Project.js";
import { TaskListProperties } from "./TaskList.js";

export class ClientDatabase extends Dexie {

  readonly attachments!: Table<AttachmentProperties>;
  readonly tasks!: Table<TaskProperties>;
  readonly taskLists!: Table<TaskListProperties>;
  readonly labels!: Table<LabelProperties>;
  readonly projects!: Table<ProjectProperties>;
  readonly settings!: Table<string>;

  constructor() {

    super("contents");

    this.version(2).stores({
      attachments: "&id, name, description, issueIds",
      tasks: "&id, dueDate, name, description, status",
      taskLists: "&id, taskIds",
      labels: "&id, name, description",
      projects: "&id, name, description",
      settings: ",personalProjectId"
    });

  }

}

const db = new ClientDatabase();

export default db;