import Attachment, { AttachmentProperties, InitialAttachmentProperties } from "./Attachment";
import Client, { PropertiesUpdate } from "./Client";

export interface IssueProperties {
  id: string;
  name: string;
  description?: string;
  isLocked?: boolean;
  labelIds?: string[];
  parentIssueId?: string;
  projectId: string;
  statusId: string;
}

export type InitialIssueProperties = Omit<IssueProperties, "id">;

export default class Issue {

  static readonly tableName = "issues" as const;

  readonly #client: Client;
  readonly id: string;
  name: string;
  description?: string;
  isLocked?: boolean;
  labelIds?: string[];
  parentIssueId?: string;
  projectId: string;
  statusId: string;

  constructor(props: IssueProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.projectId = props.projectId;
    this.labelIds = props.labelIds;
    this.parentIssueId = props.parentIssueId;
    this.isLocked = props.isLocked;
    this.statusId = props.statusId;
    this.#client = client;

  }

  async createAttachment(props: Omit<InitialAttachmentProperties, "issueIds">): Promise<Attachment> {

    return await this.#client.createAttachment({...props, issueIds: [this.id]});

  }

  async getAttachments(): Promise<Attachment[]> {

    return await this.#client.getAttachments({issueIds: [this.id]});

  }

  async delete() {

    await this.#client.deleteIssue(this.id);

  }

  async update(newProperties: PropertiesUpdate<IssueProperties>): Promise<void> {

    await this.#client.updateIssue(this.id, newProperties);

  }

}