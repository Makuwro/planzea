import ObjectID from "bson-objectid";
import { ClientDatabase } from "./ClientDatabase";
import Issue, { IssueProperties } from "./Issue";

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

    // Get an unused ID.
    
    let id = null;
    do {
      
      id = new ObjectID().toHexString();
      try {

        await clientDatabase.issues.get(id);

      } catch (err) {



      }
      
    } while (!id);

    // Create the issue.
    const issue = new Issue({id, ...props}, this);
    await clientDatabase.issues.add(issue);
    return issue;
    
  }

  /**
   * Deletes an issue from the database.
   * @param issueId The issue's ID.
   */
  async deleteIssue(issueId: string): Promise<void> {

    await this.db.issues.delete(issueId);

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

}