import Attachment, { InitialAttachmentProperties } from "./Attachment";
import Client, { PropertiesUpdate } from "./Client";

export interface TaskProperties {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  isLocked?: boolean;
  labelIds: string[];
  parentTaskId?: string;
  projectId: string;
  statusId: string;
}

export type InitialTaskProperties = Omit<TaskProperties, "id">;

export default class Task {

  static readonly tableName = "tasks" as const;

  readonly #client: Client;
  readonly id: string;
  name: string;
  description?: string;
  dueDate?: string;
  isLocked?: boolean;
  labelIds: string[];
  parentTaskId?: string;
  projectId: string;
  statusId: string;

  constructor(props: TaskProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.dueDate = props.dueDate;
    this.projectId = props.projectId;
    this.labelIds = props.labelIds;
    this.parentTaskId = props.parentTaskId;
    this.isLocked = props.isLocked;
    this.statusId = props.statusId;
    this.#client = client;

  }

  async createAttachment(props: Omit<InitialAttachmentProperties, "taskIds">): Promise<Attachment> {

    return await this.#client.createAttachment({...props, taskIds: [this.id]});

  }

  async getAttachments(): Promise<Attachment[]> {

    return await this.#client.getAttachments({taskIds: [this.id]});

  }

  async delete() {

    await this.#client.deleteTask(this.id);

  }

  async update(newProperties: PropertiesUpdate<TaskProperties>): Promise<void> {

    await this.#client.updateTask(this.id, newProperties);

  }

}