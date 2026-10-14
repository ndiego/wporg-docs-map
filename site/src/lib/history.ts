// The sourced background of the Rosetta network, imported at build time from data/rosetta-history.json.
// Every paragraph, timeline entry and role cites source ids; scripts/validate.py checks that each id exists.
import raw from "@data/rosetta-history.json";

export interface Source {
  id: string;
  title: string;
  url: string;
  publisher: string;
  date: string | null;
  supports: string;
}

export interface Paragraph {
  text: string;
  sources: string[];
}

export interface Section {
  heading: string;
  paragraphs: Paragraph[];
}

export interface TimelineEntry {
  date: string;
  event: string;
  sources: string[];
}

export interface Role {
  name: string;
  description: string;
  sources: string[];
}

interface HistoryData {
  updated: string;
  intro: string;
  sections: Section[];
  timeline: TimelineEntry[];
  roles: Role[];
  sources: Source[];
}

const data = raw as unknown as HistoryData;

export const updated = data.updated;
export const intro = data.intro;
export const sections = data.sections;
export const timeline = data.timeline;
export const roles = data.roles;
export const sources = data.sources;

/** 1-based citation number for a source id, in the order the sources are listed. */
export const sourceNumber: Record<string, number> = Object.fromEntries(sources.map((s, i) => [s.id, i + 1]));

/** "2014-09" -> "Sep 2014", "2005" -> "2005", "2016-04-21" -> "21 Apr 2016". */
export function formatDate(d: string): string {
  const [y, m, day] = d.split("-");
  if (!m) return y;
  const month = new Date(Date.UTC(Number(y), Number(m) - 1, 1)).toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return day ? `${Number(day)} ${month} ${y}` : `${month} ${y}`;
}
