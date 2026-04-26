import type { ItemCategory, Requirement, RequirementStatus } from "@hostely/shared";

export type { Requirement };

export interface CreateRequirementInput {
  ownerId: string;
  title: string;
  description: string;
  category: ItemCategory;
  budgetMax?: number;
  hostelName: string;
}

export interface ListRequirementsFilter {
  q?: string;
  category?: ItemCategory;
  hostelName?: string;
  status?: RequirementStatus;
  ownerId?: string;
  audienceHostelNames?: string[];
  page: number;
  pageSize: number;
}

export interface UpdateRequirementInput {
  title?: string;
  description?: string;
  category?: ItemCategory;
  budgetMax?: number;
  hostelName?: string;
  status?: RequirementStatus;
}
