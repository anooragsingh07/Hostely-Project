import type { ItemCategory, ItemCondition, ItemStatus } from "../constants/marketplace";

/** Compact seller reference carried on every Item payload. */
export interface ItemAuthor {
  id: string;
  name: string;
  hostelName: string;
  department: string;
  avatarUrl?: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ItemCategory;
  condition: ItemCondition;
  status: ItemStatus;
  hostelName: string;
  images: string[];
  interestsCount: number;
  author: ItemAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface ItemListFilters {
  q?: string;
  category?: ItemCategory;
  hostelName?: string;
  /** Anchor hostel for proximity sort. When set, results are ordered nearest first. */
  nearHostel?: string;
  /** Shortcut for "use my hostel as the anchor" — viewer-aware on the server. */
  sortByHostel?: boolean;
  status?: ItemStatus;
  mine?: boolean;
  page?: number;
  pageSize?: number;
}
