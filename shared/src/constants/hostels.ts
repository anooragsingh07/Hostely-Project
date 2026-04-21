/**
 * Canonical catalog of hostels on campus. Used by:
 *   - Item / Requirement creation (hostelName must resolve here)
 *   - Buy-page filter dropdown
 *   - "Nearest first" sort (zones express rough proximity)
 *
 * Adjust this list per campus deployment. Keep `name` stable — it's the
 * value persisted on documents. `aliases` help recognize legacy rows
 * during migration without breaking the drop-down.
 */
export interface HostelDefinition {
  /** Short identifier, lowercase, dash-separated. */
  readonly id: string;
  /** Human-facing display name. This is the value stored on each Item/User. */
  readonly name: string;
  /** Geographic/administrative cluster used for "nearest hostel" sorting. */
  readonly zone: string;
  /** Alternate spellings previously in the wild. Lowercased match. */
  readonly aliases?: readonly string[];
}

export const HOSTELS: readonly HostelDefinition[] = [
  // North campus cluster
  { id: "h1", name: "Hostel 1", zone: "north", aliases: ["h1", "h-1"] },
  { id: "h2", name: "Hostel 2", zone: "north", aliases: ["h2", "h-2"] },
  { id: "h3", name: "Hostel 3", zone: "north", aliases: ["h3", "h-3"] },
  { id: "h4", name: "Hostel 4", zone: "north", aliases: ["h4", "h-4"] },

  // Central cluster
  { id: "h5", name: "Hostel 5", zone: "central", aliases: ["h5", "h-5"] },
  { id: "h6", name: "Hostel 6", zone: "central", aliases: ["h6", "h-6"] },
  { id: "h7", name: "Hostel 7", zone: "central", aliases: ["h7", "h-7"] },

  // South / lake-side cluster
  { id: "h8", name: "Hostel 8", zone: "south", aliases: ["h8", "h-8"] },
  { id: "h9", name: "Hostel 9", zone: "south", aliases: ["h9", "h-9"] },
  { id: "h10", name: "Hostel 10", zone: "south", aliases: ["h10"] },

  // Girls' wing cluster
  { id: "h11", name: "Hostel 11", zone: "west", aliases: ["h11"] },
  { id: "h12", name: "Hostel 12", zone: "west", aliases: ["h12"] },

  // Postgrad cluster
  { id: "h13", name: "Hostel 13", zone: "pg", aliases: ["h13", "qip"] },
  { id: "h14", name: "Hostel 14", zone: "pg", aliases: ["h14"] },
  { id: "h15", name: "Hostel 15", zone: "pg", aliases: ["h15"] },
  { id: "h16", name: "Hostel 16", zone: "pg", aliases: ["h16", "tansa"] },
] as const;

/** Fast display-name index. Built once; safe because the list is a module constant. */
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

/** List of names in the same zone — useful for building $in queries. */
export const hostelsInZone = (zone: string): string[] =>
  HOSTELS.filter((h) => h.zone === zone).map((h) => h.name);

/**
 * Rough integer distance between two hostels:
 *   0 — same hostel
 *   1 — same zone (adjacent)
 *   2 — different zone (far)
 *
 * Unknown hostels are treated as "far" so they still sort after matches.
 */
export const hostelDistance = (a: string, b: string): 0 | 1 | 2 => {
  const ha = getHostel(a);
  const hb = getHostel(b);
  if (!ha || !hb) return 2;
  if (ha.id === hb.id) return 0;
  if (ha.zone === hb.zone) return 1;
  return 2;
};

/** The set of allowed names — handy for validators on both sides. */
export const HOSTEL_NAMES: readonly string[] = HOSTELS.map((h) => h.name);
