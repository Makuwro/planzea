import Project from "./Project";
import Task from "./Task";

interface EventCallbacks {
  currentProjectChange: ((project: Project | null) => void) | (() => void);
  taskBacklogSelectionChange: ((tasks: Task[]) => void) | (() => void);
}

type EventCallbacksArray = {
  [EventName in keyof EventCallbacks]: EventCallbacks[EventName][];
};

type MutableUIClient = {
  -readonly [K in keyof UIClient]: UIClient[K];
};

export default class UIClient {

  #eventCallbacks: EventCallbacksArray = {
    currentProjectChange: [],
    taskBacklogSelectionChange: []
  };
  readonly selectedTasks: Task[] = [];
  readonly currentProject: Project | null = null;

  addEventListener<EventName extends keyof EventCallbacksArray>(eventName: EventName, callback: EventCallbacks[EventName]): void {

    this.#eventCallbacks[eventName].push(callback as () => void);

  }

  #fireEvent<EventName extends keyof EventCallbacksArray>(eventName: EventName, ...props: Parameters<EventCallbacks[EventName]>): void {

    for (const callback of this.#eventCallbacks[eventName]) {

      (callback as (...props: Parameters<EventCallbacks[EventName]>) => void)(...props);

    }

  }

  removeEventListener<EventName extends keyof EventCallbacksArray>(eventName: EventName, callback: EventCallbacks[EventName]): void {

    this.#eventCallbacks[eventName] = (this.#eventCallbacks[eventName] as (() => void)[]).filter((possibleCallback) => possibleCallback !== callback);

  }

  setCurrentProject(project: Project | null): void {

    (this as MutableUIClient).currentProject = project;

    this.#fireEvent("currentProjectChange", project);

  }

  setSelectedTasks(tasks: Task[]): void {

    (this as MutableUIClient).selectedTasks = tasks;

    this.#fireEvent("taskBacklogSelectionChange", tasks);

  }

}