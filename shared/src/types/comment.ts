import type { CommentParentType } from "../constants/marketplace";
import type { ItemAuthor } from "./item";

export interface Comment {
  id: string;
  parentType: CommentParentType;
  parentId: string;
  body: string;
  author: ItemAuthor;
  createdAt: string;
  updatedAt: string;
}
