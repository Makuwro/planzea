import Client from "./Client";

export interface IssueProperties {
  id: string;
  name: string;
  description?: string;
  labels?: string[];
  isLocked?: boolean;
  status?: string;
}

export default class Issue {

  #client: Client;
  id: string;
  name: string;
  description?: string;
  labels?: string[];
  isLocked?: boolean;
  status?: string;

  constructor(props: IssueProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.labels = props.labels;
    this.isLocked = props.isLocked;
    this.status = props.status;
    this.#client = client;

  }

  async delete() {

    this.#client.deleteIssue(this.id);

  }

}