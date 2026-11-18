export type Section = {
  id: string;
  /** Heading text, or "도입부" for the text before the first heading. */
  title: string;
  isIntro: boolean;
  /** The section's Markdown without its heading line. */
  body: string;
  /** The heading line as written (empty for the intro). */
  heading: string;
};

const HEADING = /^(#{1,3})\s+(.+?)\s*#*\s*$/;
const FENCE = /^\s*(```|~~~)/;

/** Heading level per line (0 when not a #–### heading or inside a fenced code block). */
function headingLevels(lines: string[]): number[] {
  let inFence = false;
  return lines.map((line) => {
    if (FENCE.test(line)) {
      inFence = !inFence;
      return 0;
    }
    if (inFence) return 0;
    return HEADING.exec(line)?.[1].length ?? 0;
  });
}

const trimBlankLines = (lines: string[]) => lines.join("\n").replace(/^\s*\n/, "").trim();

/** Splits Markdown at its shallowest #–### heading level; text before the first heading becomes "도입부". */
export function splitSections(markdown: string): Section[] {
  const lines = markdown.split("\n");
  const levels = headingLevels(lines);
  const present = levels.filter((level) => level > 0);
  const top = present.length ? Math.min(...present) : 0;

  const sections: Section[] = [];
  let current: { heading: string; title: string; lines: string[] } = { heading: "", title: "도입부", lines: [] };
  const flush = () => {
    const body = trimBlankLines(current.lines);
    if (!current.heading && !body) return;
    sections.push({
      id: `s${sections.length}`,
      title: current.title,
      isIntro: !current.heading,
      body,
      heading: current.heading,
    });
  };

  lines.forEach((line, index) => {
    if (top && levels[index] === top) {
      flush();
      current = { heading: line.trim(), title: HEADING.exec(line)![2], lines: [] };
    } else {
      current.lines.push(line);
    }
  });
  flush();
  return sections;
}

/** Joins the selected sections back into Markdown, keeping their order and heading lines. */
export function joinSections(sections: Section[], selected: ReadonlySet<string>): string {
  return sections
    .filter((section) => selected.has(section.id))
    .map((section) => [section.heading, section.body].filter(Boolean).join("\n\n"))
    .join("\n\n");
}
