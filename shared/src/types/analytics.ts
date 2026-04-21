import type { ItemStatus } from "../constants/marketplace";

/** Single `(label, value)` row. Used for bar/pie chart series. */
export interface AnalyticsBucket {
  /** Display label — category slug, hostel name, status, etc. */
  label: string;
  /** Integer count for that bucket. */
  count: number;
}

/** One day on the timeline. `date` is an ISO-8601 YYYY-MM-DD string. */
export interface AnalyticsTimelinePoint {
  date: string;
  items: number;
  requirements: number;
}

/**
 * Snapshot consumed by the admin dashboard. Aggregated server-side so
 * clients don't scan collections and the chart surfaces render fast.
 */
export interface AnalyticsSnapshot {
  totals: {
    items: number;
    activeItems: number;
    removedItems: number;
    requirements: number;
    users: number;
  };
  /** Item counts grouped by their current status. */
  itemsByStatus: Array<{ label: ItemStatus; count: number }>;
  /** Popularity of each category — sorted desc by count. */
  itemsByCategory: AnalyticsBucket[];
  /** Listings by hostel — sorted desc by count, top N. */
  itemsByHostel: AnalyticsBucket[];
  /** Requirements by category — sorted desc by count. */
  requirementsByCategory: AnalyticsBucket[];
  /** Last 30 days of new listings + requirements. Gaps are filled with zeros. */
  timeline: AnalyticsTimelinePoint[];
  /** When this snapshot was computed. */
  generatedAt: string;
}
