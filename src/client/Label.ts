import Client, { PropertiesUpdate } from "./Client";

export interface LabelProperties {
  id: string;
  name: string;
  description?: string;
  projects?: string[];
  color?: string;
}

export type InitialLabelProperties = Omit<LabelProperties, "id">;

export default class Label {

  static readonly tableName = "labels" as const;
  
  readonly #client: Client;
  readonly id: string;
  name: string;
  description?: string;
  projects?: string[];
  color?: string;

  constructor(props: LabelProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.color = props.color;
    this.projects = props.projects;
    this.#client = client;

  }

  async delete(): Promise<void> {

    await this.#client.deleteLabel(this.id);

  }

  async removeFromProject(projectId: string): Promise<void> {

    await this.#client.removeLabelFromProject(this.id, projectId);

  }

  async update(newProperties: PropertiesUpdate<LabelProperties>): Promise<void> {

    await this.#client.updateLabel(this.id, newProperties);

  }

}