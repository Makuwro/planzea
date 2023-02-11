import ObjectID from "bson-objectid";
import { ClientDatabase } from "./ClientDatabase";
import Issue, { IssueProperties } from "./Issue";
import Label, { LabelProperties } from "./Label";

export type PropertiesUpdate<T> = Partial<Omit<T, "id">>;

const clientDatabase = new ClientDatabase();

export default class Client {

  db = clientDatabase;
  eventListeners = [];

  /**
   * Adds an issue to the database.
   * @param props Issue properties.
   * @returns An `Issue` object.
   */
  async createIssue(props: Omit<IssueProperties, "id">): Promise<Issue> {

    const issue = new Issue({
      id: await this.#getUnusedId("issues"), 
      ...props
    }, this);
    await clientDatabase.issues.add(issue);
    return issue;
    
  }

  async createLabel(props: Omit<LabelProperties, "id">): Promise<Label> {

    const label = new Label({
      id: await this.#getUnusedId("labels"), 
      ...props
    }, this);
    await clientDatabase.labels.add(label);
    return label;

  }

  /**
   * Deletes an issue from the database.
   * @param issueId The issue's ID.
   */
  async deleteIssue(issueId: string): Promise<void> {

    await this.db.issues.delete(issueId);

  }

  async deleteLabel(labelId: string): Promise<void> {

    await this.db.labels.delete(labelId);

  }

  async getIssue(issueId: string): Promise<Issue> {

    const properties = await this.db.issues.get(issueId);

    if (!properties) {

      throw new Error();

    }

    return new Issue(properties, this);

  }

  /**
   * Gets all client issues.
   * @returns An array of `Issue`.
   */
  async getIssues(): Promise<Issue[]> {

    const issues = [];

    for (const properties of await this.db.issues.toArray()) {

      issues.push(new Issue(properties, this));

    }

    return issues;

  }

  async updateIssue(labelId: string, newProperties: PropertiesUpdate<IssueProperties>): Promise<void> {

    await this.db.issues.update(labelId, newProperties);

  }

  async updateLabel(labelId: string, newProperties: PropertiesUpdate<LabelProperties>): Promise<void> {

    await this.db.labels.update(labelId, newProperties);

  }

  async #getUnusedId(contentType: "issues" | "labels"): Promise<string> {

    let id;
    do {
      
      id = new ObjectID().toHexString();
      try {

        await clientDatabase[contentType].get(id);

      } catch (err) {

      }
      
    } while (!id);

    return id;

  }

}