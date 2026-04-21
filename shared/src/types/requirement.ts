import type { ItemCategory, RequirementStatus } from "../constants/marketplace";
import type { ItemAuthor } from "./item";

export interface Requirement {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  budgetMax?: number;
  hostelName: string;
  status: RequirementStatus;
  author: ItemAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface RequirementListFilters {
  q?: string;
  category?: ItemCategory;
  hostelName?: string;
  status?: RequirementStatus;
  mine?: boolean;
  page?: number;
  pageSize?: number;
}
