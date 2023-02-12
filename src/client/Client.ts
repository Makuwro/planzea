import ObjectID from "bson-objectid";
import { ClientDatabase } from "./ClientDatabase";
import Issue, { IssueProperties } from "./Issue";
import Label, { LabelProperties } from "./Label";

export type PropertiesUpdate<T> = Partial<Omit<T, "id">>;

const clientDatabase = new ClientDatabase();

export default class Client {

  db = clientDatabase;

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
   * @returns An array of `Issue` objects.
   */
  async getIssues(filter: Partial<IssueProperties> = {}, exclusiveKeys: [(keyof IssueProperties)?] = []): Promise<Issue[]> {

    const issues = [];
    const issuePropertiesArray = (await this.db.issues.toArray()).filter((issue) => {

      for (const key of Object.keys(filter) as (keyof IssueProperties)[]) {

        const issueValue = issue[key];
        const filterValue = filter[key];
        if (issueValue instanceof Array && filterValue instanceof Array) {

          const includesKey = issueValue.includes(key);
          if (exclusiveKeys.includes(key) ? !includesKey : includesKey) {

            return false;

          }

        } else if (exclusiveKeys.includes(key) ? issueValue === filterValue : issueValue !== filterValue) {

          return false;

        }

      }

      return true;

    });

    for (const properties of issuePropertiesArray) {

      issues.push(new Issue(properties, this));

    }

    return issues;

  }

  /**
   * Gets all client labels.
   * @returns An array of `Label` objects.
   */
  async getLabels(filter: Partial<LabelProperties> = {}, exclusiveKeys: [(keyof LabelProperties)?] = []): Promise<Label[]> {

    const labels = [];
    const labelPropertiesArray = (await this.db.labels.toArray()).filter((label) => {

      for (const key of Object.keys(filter) as (keyof LabelProperties)[]) {

        const labelValue = label[key];
        const filterValue = filter[key];
        if (exclusiveKeys.includes(key) ? labelValue === filterValue : labelValue !== filterValue) {

          return false;

        }

      }

      return true;

    });

    for (const properties of labelPropertiesArray) {

      labels.push(new Label(properties, this));

    }

    return labels;

  }

  async updateIssue(labelId: string, newProperties: PropertiesUpdate<IssueProperties>): Promise<void> {

    await this.db.issues.update(labelId, newProperties);

  }

  async updateLabel(labelId: string, newProperties: PropertiesUpdate<LabelProperties>): Promise<void> {

    await this.db.labels.update(labelId, newProperties);

  }

  async #getUnusedId(contentType: "issues" | "labels"): Promise<string> {

    let id = null;
    do {
      
      id = new ObjectID().toHexString();
      if (await clientDatabase[contentType].get(id)) {

        id = null;

      }
      
    } while (!id);

    return id;

  }

}