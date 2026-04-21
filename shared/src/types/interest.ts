import type { ItemAuthor } from "./item";

export interface Interest {
  id: string;
  itemId: string;
  user: ItemAuthor;
  note?: string;
  createdAt: string;
}
