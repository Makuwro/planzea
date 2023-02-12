import Client, { PropertiesUpdate } from "./Client";

export interface LabelProperties {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export default class Label {

  #client: Client;
  id: string;
  name: string;
  description?: string;
  projects?: string[];
  color?: string;

  constructor(props: LabelProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.color = props.color;
    this.#client = client;

  }

  async delete(): Promise<void> {

    await this.#client.deleteLabel(this.id);

  }

  async update(newProperties: PropertiesUpdate<LabelProperties>): Promise<void> {

    await this.#client.updateLabel(this.id, newProperties);

  }

}