import Client, { PropertiesUpdate } from "./Client";

export interface AttachmentProperties {
  arrayBuffer: ArrayBuffer;
  id: string;
  taskIds: string[];
  name: string;
  type: string;
}

export type InitialAttachmentProperties = Omit<AttachmentProperties, "id">;

export default class Attachment {

  static readonly tableName = "attachments" as const;

  readonly #client: Client;
  arrayBuffer: ArrayBuffer;
  id: string;
  taskIds: string[];
  name: string;
  type: string;

  constructor(props: AttachmentProperties, client: Client) {

    this.arrayBuffer = props.arrayBuffer;
    this.id = props.id;
    this.taskIds = props.taskIds;
    this.name = props.name;
    this.type = props.type;
    this.#client = client;
    
  }

  async delete() {
    
    await this.#client.deleteAttachment(this.id);

  }

  async update(newProperties: PropertiesUpdate<AttachmentProperties>): Promise<void> {

    await this.#client.updateAttachment(this.id, newProperties);

  }

}