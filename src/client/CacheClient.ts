import Client, { EventCallbacks } from "./Client";
import Project from "./Project";
import Task from "./Task";

interface CacheEventCallbacks extends EventCallbacks {
  currentProjectChange: ((project: Project | null) => void) | (() => void);
  projectsArrayChange: ((projects: Project[]) => void) | (() => void);
  taskBacklogSelectionChange: ((tasks: Task[]) => void) | (() => void);
}

type EventCallbacksArray = {
  [EventName in keyof CacheEventCallbacks]: CacheEventCallbacks[EventName][];
};

type MutableCacheClient = {
  -readonly [K in keyof CacheClient]: CacheClient[K];
};

export default class CacheClient extends Client {

  protected eventCallbacks: EventCallbacksArray = {
    ...this.eventCallbacks,
    currentProjectChange: [],
    taskBacklogSelectionChange: [],
    projectsArrayChange: []
  };
  readonly projects: Project[] | null = null;
  readonly selectedTasks: Task[] = [];
  readonly currentProject: Project | null = null;

  async getProjects(...parameters: Parameters<Client["getProjects"]>): Promise<Project[]> {

    if (!this.projects) {

      (this as MutableCacheClient).projects = await super.getProjects(...parameters);
      this.#fireEvent("projectsArrayChange", this.projects ?? []);

    }

    return this.projects ?? [];

  }

  addEventListener<EventName extends keyof EventCallbacksArray>(eventName: EventName, callback: CacheEventCallbacks[EventName]): void {

    this.eventCallbacks[eventName].push(callback as () => void);

  }

  #fireEvent<EventName extends keyof EventCallbacksArray>(eventName: EventName, ...props: Parameters<CacheEventCallbacks[EventName]>): void {

    for (const callback of this.eventCallbacks[eventName]) {

      (callback as (...props: Parameters<CacheEventCallbacks[EventName]>) => void)(...props);

    }

  }

  removeEventListener<EventName extends keyof EventCallbacksArray>(eventName: EventName, callback: CacheEventCallbacks[EventName]): void {

    this.eventCallbacks[eventName] = (this.eventCallbacks[eventName] as (() => void)[]).filter((possibleCallback) => possibleCallback !== callback);

  }

  setCurrentProject(project: Project | null): void {

    (this as MutableCacheClient).currentProject = project;

    this.#fireEvent("currentProjectChange", project);

  }

  setSelectedTasks(tasks: Task[]): void {

    (this as MutableCacheClient).selectedTasks = tasks;

    this.#fireEvent("taskBacklogSelectionChange", tasks);

  }

}