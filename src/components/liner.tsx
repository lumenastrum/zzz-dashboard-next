import { Fragment, type ReactNode } from "react";
import { elementColor } from "@/lib/deck-config";

// Liner-note rich text for the pull crates. The why/team strings stay plain prose in
// pull-priority.ts — this renderer adds the reading aids: "\n\n" splits paragraphs,
// "\n" is a soft line break, and known vocabulary gets auto-highlighted (agent names
// bright, element words tinted in their element's color, specialty/mechanic terms in
// the crate accent). Matching is case-sensitive on purpose: "Stun DMG" highlights,
// "longer stun windows" doesn't.

const AGENTS = [
  "Ye Shunguang", "Yixuan", "Yidhari", "Sunna", "Dialyn", "Lucia", "Cissia", "Yanagi",
  "Alice", "Miyabi", "Vivian", "Yuzuha", "Astra", "Nicole", "Zhao", "Ju Fufu", "Norma",
  "Sigrid", "Remielle Dan", "Remielle", "Seed", "Burnice", "Evelyn", "Lighter", "Lucy",
  "Pan Yinhu", "Nangong Yu", "Trigger", "Soldier 0 Anby", "Soldier 0-Anby", "Anby",
  "Orphie", "Magus", "Lycaon", "Soukaku", "Velina", "Jane Doe", "Jane", "Aria", "Hugo",
  "Caesar", "Zhu Yuan", "Harumasa", "BanYue", "Ye",
];
const ELEMENTS = [
  "Physical", "Fire", "Ice", "Electric", "Ether", "Wind", "Frost", "Lumiflux",
  "Auric Ink", "Honed Edge",
];
const TERMS = [
  "Stun", "Anomaly", "Attack", "Rupture", "Support", "Defense",
  "Disorder", "Vortex", "Sheer Force", "Refringe", "Aftershock", "Sky Knight",
];

const AGENT_SET = new Set(AGENTS);
const ELEMENT_SET = new Set(ELEMENTS);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Longest alternative first so "Remielle Dan" wins over "Remielle", "Jane Doe" over "Jane".
const VOCAB = [...AGENTS, ...ELEMENTS, ...TERMS].sort((a, b) => b.length - a.length);
const RX = new RegExp(`\\b(${VOCAB.map(esc).join("|")})\\b`, "g");

function highlight(text: string, key: string): ReactNode[] {
  // split() with a capturing group alternates plain / matched chunks.
  return text.split(RX).map((chunk, i) => {
    if (i % 2 === 0) return chunk;
    if (ELEMENT_SET.has(chunk)) {
      // Mix toward ink so dim element hues (Ether) stay readable on the dark panel.
      const c = `color-mix(in srgb, ${elementColor(chunk)} 72%, var(--ink))`;
      return <b key={`${key}-${i}`} className="ln-e" style={{ color: c }}>{chunk}</b>;
    }
    if (AGENT_SET.has(chunk)) return <b key={`${key}-${i}`} className="ln-a">{chunk}</b>;
    return <b key={`${key}-${i}`} className="ln-s">{chunk}</b>;
  });
}

// Inline run with soft line breaks (used for the team block).
export function linerInline(text: string): ReactNode {
  return text.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {highlight(line, `l${i}`)}
    </Fragment>
  ));
}

// Full liner body: "\n\n" → paragraphs (used for the why block).
export function linerParagraphs(text: string): ReactNode {
  return text.split("\n\n").map((para, i) => <p key={i}>{linerInline(para)}</p>);
}
