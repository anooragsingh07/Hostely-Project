/**
 * Canonical catalog of hostels on campus. Used by:
 *   - Item / Requirement creation (hostelName must resolve here)
 *   - Buy-page filter dropdown
 *   - "Nearest first" sort (zones group hostels for proximity)
 *   - Marketplace visibility: listings in one segment are not shown to the other
 *
 * CGC — boys and girls hostels are separate segments.
 */
export type HostelSegment = "boys" | "girls";

export interface HostelDefinition {
  readonly id: string;
  readonly name: string;
  /** Cluster for "nearest hostel" sorting within the same segment. */
  readonly zone: string;
  readonly segment: HostelSegment;
  readonly aliases?: readonly string[];
}

export const HOSTELS: readonly HostelDefinition[] = [
  { id: "sukhsagar", name: "Sukhsagar", zone: "boys", segment: "boys" },
  { id: "sadhbhavna", name: "Sadhbhavna", zone: "boys", segment: "boys" },
  { id: "new-boys", name: "New Boys", zone: "boys", segment: "boys" },
  { id: "shantikunj", name: "Shantikunj", zone: "boys", segment: "boys" },
  { id: "kalpna", name: "Kalpna", zone: "girls", segment: "girls" },
] as const;

const HOSTEL_BY_NAME = new Map(HOSTELS.map((h) => [h.name.toLowerCase(), h]));

const HOSTEL_BY_ALIAS = new Map<string, HostelDefinition>();
HOSTELS.forEach((h) => {
  (h.aliases ?? []).forEach((a) => HOSTEL_BY_ALIAS.set(a.toLowerCase(), h));
});

/** Resolve a stored hostel string (name or legacy alias) to a canonical record. */
export const getHostel = (raw: string | undefined | null): HostelDefinition | null => {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  return HOSTEL_BY_NAME.get(key) ?? HOSTEL_BY_ALIAS.get(key) ?? null;
};

/** Segment for a user's profile hostel, if it matches the catalog. */
export const getHostelSegmentForUserHostel = (hostelName: string): HostelSegment | null =>
  getHostel(hostelName)?.segment ?? null;

/** Canonical names in one segment — for server-side marketplace gates. */
export const hostelNamesInSegment = (segment: HostelSegment): readonly string[] =>
  HOSTELS.filter((h) => h.segment === segment).map((h) => h.name);

/** Hostels the viewer may browse or list under (same segment; unknown segment → all). */
export const hostelsInViewerSegment = (
  viewerHostelName: string | undefined,
): readonly HostelDefinition[] => {
  if (!viewerHostelName) return HOSTELS;
  const seg = getHostelSegmentForUserHostel(viewerHostelName);
  if (!seg) return HOSTELS;
  return HOSTELS.filter((h) => h.segment === seg);
};

/** List of names in the same zone — for proximity sort buckets. */
export const hostelsInZone = (zone: string): string[] =>
  HOSTELS.filter((h) => h.zone === zone).map((h) => h.name);

/**
 * Rough integer distance between two hostels:
 *   0 — same hostel
 *   1 — same zone (adjacent)
 *   2 — different zone or segment (far)
 *
 * Unknown hostels are treated as "far" so they still sort after matches.
 */
export const hostelDistance = (a: string, b: string): 0 | 1 | 2 => {
  const ha = getHostel(a);
  const hb = getHostel(b);
  if (!ha || !hb) return 2;
  if (ha.segment !== hb.segment) return 2;
  if (ha.id === hb.id) return 0;
  if (ha.zone === hb.zone) return 1;
  return 2;
};

/** Allowed names for validators on both sides. */
export const HOSTEL_NAMES: readonly string[] = HOSTELS.map((h) => h.name);
