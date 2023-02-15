import ObjectID from "bson-objectid";
import { ClientDatabase } from "./ClientDatabase";
import Issue, { InitialIssueProperties, IssueProperties } from "./Issue";
import Label, { InitialLabelProperties, LabelProperties } from "./Label";
import Project, { InitialProjectProperties, ProjectProperties } from "./Project";

export type PropertiesUpdate<T> = Partial<Omit<T, "id">>;

export type PlanzeaObject = typeof Issue | typeof Label | typeof Project;
export type PlanzeaObjectProperties = IssueProperties & LabelProperties & ProjectProperties;

const clientDatabase = new ClientDatabase();

export default class Client {

  readonly #db = clientDatabase;

  async #createObject(constructor: typeof Issue, props: InitialIssueProperties): Promise<Issue>;
  async #createObject(constructor: typeof Label, props: InitialLabelProperties): Promise<Label>;
  async #createObject(constructor: typeof Project, props: InitialProjectProperties): Promise<Project>;
  async #createObject(constructor: typeof Issue | typeof Label | typeof Project, props: InitialIssueProperties | InitialLabelProperties | InitialProjectProperties): Promise<Issue | Label | Project> {

    const { tableName } = constructor;
    const content = new constructor({
      id: await this.#getUnusedId(tableName), 
      ...props
    } as PlanzeaObjectProperties, this);
    await clientDatabase[tableName].add(content as PlanzeaObjectProperties);
    return content;

  }

  async #getObject(constructor: typeof Issue, objectId: string): Promise<Issue>;
  async #getObject(constructor: typeof Project, objectId: string): Promise<Project>;
  async #getObject(constructor: PlanzeaObject, objectId: string): Promise<Issue | Label | Project> {

    const properties = await this.#db[constructor.tableName].get(objectId);

    if (!properties) {

      throw new Error();

    }

    return new (constructor)(properties as PlanzeaObjectProperties, this);

  }

  /**
   * Finds an unused ID string for a specific table.
   * @param tableName The name of the table.
   * @returns An unused ID string.
   */
  async #getUnusedId(tableName: "issues" | "labels" | "projects"): Promise<string> {

    let id = null;
    do {
      
      id = new ObjectID().toHexString();
      if (await clientDatabase[tableName].get(id)) {

        id = null;

      }
      
    } while (!id);

    return id;

  }

  /**
   * Adds an issue to the database.
   * @param props Issue properties.
   * @returns An `Issue` object.
   */
  async createIssue(props: InitialIssueProperties): Promise<Issue> {

    return this.#createObject(Issue, props);
    
  }

  async createLabel(props: InitialLabelProperties): Promise<Label> {

    return this.#createObject(Label, props);

  }

  async createProject(props: InitialProjectProperties): Promise<Project> {

    return this.#createObject(Project, props);

  }

  /**
   * Deletes an issue from the database.
   * @param issueId The issue's ID.
   */
  async deleteIssue(issueId: string): Promise<void> {

    await this.#db.issues.delete(issueId);

  }

  async deleteLabel(labelId: string): Promise<void> {

    await this.#db.labels.delete(labelId);

  }

  async deleteProject(projectId: string): Promise<void> {

    await this.#db.projects.delete(projectId);

  }

  async getIssue(issueId: string): Promise<Issue> {

    return await this.#getObject(Issue, issueId);

  }

  /**
   * Gets all client issues.
   * @returns An array of `Issue` objects.
   */
  async getIssues(filter: Partial<IssueProperties> = {}, exclusiveKeys: [(keyof IssueProperties)?] = []): Promise<Issue[]> {

    const issues = [];
    const issuePropertiesArray = (await this.#db.issues.toArray()).filter((issue) => {

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
    const labelPropertiesArray = (await this.#db.labels.toArray()).filter((label) => {

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

  async getProject(projectId: string): Promise<Project> {

    return await this.#getObject(Project, projectId);

  }

  async getProjects(filter: Partial<ProjectProperties> = {}, exclusiveKeys: [(keyof ProjectProperties)?] = []): Promise<Project[]> {

    const projects = [];
    const projectPropertiesArray = (await this.#db.projects.toArray()).filter((project) => {

      for (const key of Object.keys(filter) as (keyof ProjectProperties)[]) {

        const labelValue = project[key];
        const filterValue = filter[key];
        if (exclusiveKeys.includes(key) ? labelValue === filterValue : labelValue !== filterValue) {

          return false;

        }

      }

      return true;

    });

    for (const properties of projectPropertiesArray) {

      projects.push(new Project(properties, this));

    }

    return projects;

  }

  async updateIssue(labelId: string, newProperties: PropertiesUpdate<IssueProperties>): Promise<void> {

    await this.#db.issues.update(labelId, newProperties);

  }

  async updateLabel(labelId: string, newProperties: PropertiesUpdate<LabelProperties>): Promise<void> {

    await this.#db.labels.update(labelId, newProperties);

  }

  async updateProject(projectId: string, newProperties: PropertiesUpdate<ProjectProperties>): Promise<void> {

    await this.#db.projects.update(projectId, newProperties);

  }

}