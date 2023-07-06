import Client, { Optional, PropertiesUpdate } from "./Client";

export interface LabelProperties {
  id: string;
  name: string;
  description?: string;
  projects?: string[];
  color: number;
}

export type InitialLabelProperties = Optional<Omit<LabelProperties, "id">, "color">;

export default class Label {

  static readonly tableName = "labels" as const;
  
  /**
   * A reference to the client.
   * @since v1.0.0
   */
  readonly #client: Client;

  /**
   * This label's ID.
   * @since v1.0.0
   */
  readonly id: LabelProperties["id"];

  /**
   * This label's name.
   * @since v1.0.0
   */
  readonly name: LabelProperties["name"];

  /**
   * This label's description.
   * @since v1.0.0
   */
  readonly description: LabelProperties["description"];

  /**
   * An array of project IDs that use this label.
   * @deprecated since v1.1.0. Removing in v2.0.0.
   * @since v1.0.0
   */
  readonly projects: LabelProperties["projects"];
  
  /**
   * This label's color, represented in decimal.
   * @since v1.0.0
   */
  readonly color: LabelProperties["color"];

  constructor(props: LabelProperties, client: Client) {

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.color = props.color ?? 0;
    this.projects = props.projects;
    this.#client = client;

  }

  async delete(): Promise<void> {

    await this.#client.deleteLabel(this.id);

  }

  async update(newProperties: PropertiesUpdate<LabelProperties>): Promise<void> {

    await this.#client.updateLabel(this.id, newProperties);

  }

}