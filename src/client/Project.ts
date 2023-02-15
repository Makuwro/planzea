import Client, { PropertiesUpdate } from "./Client";
import Issue from "./Issue";
import Label from "./Label";

export interface ProjectProperties {
  id: string;
  name: string;
  description?: string;
  isArchived?: boolean;
  isRecycled?: boolean;
}

export type InitialProjectProperties = Omit<ProjectProperties, "id">;

export default class Project {

  static readonly tableName = "projects" as const;
  
  readonly id: string;
  name: string;
  description?: string;
  isArchived?: boolean;
  isRecycled?: boolean;
  #client: Client;

  constructor(props: ProjectProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.isArchived = props.isArchived;
    this.isRecycled = props.isRecycled;
    this.#client = client;

  }

  async delete(): Promise<void> {

    await this.#client.deleteProject(this.id);

  }

  async getIssues(): Promise<Issue[]> {

    return this.#client.getIssues({projects: [this.id]});

  }

  async getLabels(): Promise<Label[]> {

    return this.#client.getLabels({projects: [this.id]});

  }

  async update(newProperties: PropertiesUpdate<ProjectProperties>): Promise<void> {

    await this.#client.updateProject(this.id, newProperties);
    
  }

}