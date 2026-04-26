import type { Item, ItemCategory, ItemCondition, ItemStatus } from "@hostely/shared";

export type { Item };

export interface CreateItemInput {
  ownerId: string;
  title: string;
  description: string;
  price: number;
  category: ItemCategory;
  condition: ItemCondition;
  hostelName: string;
  images?: string[];
}

export interface UpdateItemInput {
  title?: string;
  description?: string;
  price?: number;
  category?: ItemCategory;
  condition?: ItemCondition;
  status?: ItemStatus;
  images?: string[];
}

export interface ListItemsFilter {
  q?: string;
  category?: ItemCategory;
  hostelName?: string;
  /**
   * When provided, results are sorted by proximity to this hostel
   * (same hostel → same zone → other) before falling back to createdAt desc.
   */
  nearHostel?: string;
  status?: ItemStatus;
  ownerId?: string;
  /**
   * Limits listings to these hostels (viewer campus segment). Omitted for admin-style listings.
   */
  audienceHostelNames?: string[];
  page: number;
  pageSize: number;
}
