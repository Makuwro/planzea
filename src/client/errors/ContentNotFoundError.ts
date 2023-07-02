export class ContentNotFoundError extends Error {

  id: string;

  constructor(id: string) {

    super("Couldn't find content");
    this.id = id;

  }

}