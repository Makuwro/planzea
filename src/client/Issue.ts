import Client, { PropertiesUpdate } from "./Client";

export interface IssueProperties {
  id: string;
  name: string;
  description?: string;
  projects: string[];
  labels?: string[];
  isLocked?: boolean;
  status: string;
}

export type InitialIssueProperties = Omit<IssueProperties, "id">;

export default class Issue {

  static readonly tableName = "issues" as const;

  readonly #client: Client;
  readonly id: string;
  name: string;
  description?: string;
  projects: string[];
  labels?: string[];
  isLocked?: boolean;
  status: string;

  constructor(props: IssueProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.projects = props.projects;
    this.labels = props.labels;
    this.isLocked = props.isLocked;
    this.status = props.status;
    this.#client = client;

  }

  async delete() {

    await this.#client.deleteIssue(this.id);

  }

  async update(newProperties: PropertiesUpdate<IssueProperties>): Promise<void> {

    await this.#client.updateIssue(this.id, newProperties);

  }

}