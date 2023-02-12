import Client from "./Client";
import Issue from "./Issue";

export interface ProjectProperties {
  id: string;
  name: string;
  description: string;
  isArchived?: boolean;
  isRecycled?: boolean;
}

export default class Project {

  id: string;
  name: string;
  description: string;
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

  async getIssues(): Promise<Issue[]> {

    return this.#client.getIssues({projects: [this.id]});

  }

}