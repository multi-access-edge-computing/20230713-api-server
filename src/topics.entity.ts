import { faker } from "@faker-js/faker";

export class TopicsEntity {
  private id: number;
  private title: string;
  private author: string;
  private contents: string;
  private createdAt: Date;

  constructor(id: number) {
    this.id = id;
    this.title = faker.lorem.sentences();
    this.author = faker.person.firstName();
    this.contents = faker.lorem.paragraph();
    this.createdAt = faker.date.recent();
  }

  load() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      contents: this.contents,
      createdAt: this.createdAt.toDateString(),
    };
  }
}
