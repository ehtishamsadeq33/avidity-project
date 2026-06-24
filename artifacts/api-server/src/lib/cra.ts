import { QUESTIONS } from "./questions";

const labelToId: Record<string, string> = {};
for (const q of QUESTIONS) labelToId[String(q.label)] = q.id;

function sumByLabels(
  answers: Record<string, number>,
  labels: string[],
): number {
  let total = 0;
  let matched = 0;
  const skipped: string[] = [];
  for (const label of labels) {
    const id = labelToId[label];
    if (!id) {
      skipped.push(label);
      continue;
    }
    const v = answers[id];
    if (typeof v === "number" && Number.isFinite(v)) {
      total += v;
      matched++;
    } else {
      skipped.push(label);
    }
  }
  return total;
}

function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

const PERCEIVED_LABELS = [
  "2",
  "5",
  "8",
  "11",
  "14",
  "17",
  "20",
  "33",
  "36",
  "45",
  "48",
  "55",
  "58",
  "70",
  "73",
  "76",
  "79",
  "82",
  "85",
  "88",
  "95",
  "97.1",
  "99",
  "102",
  "105",
  "108",
  "111",
  "113",
  "115",
  "117",
  "119",
  "122",
  "123",
  "124",
  "125",
  "126",
  "127",
];

const ACTUAL_LABELS = ["5", "8", "9", "12", "36", "73", "102", "123", "124"];

const BEHAVIOR_LABELS = [
  "2",
  "5",
  "8",
  "11",
  "14",
  "17",
  "20",
  "99",
  "102",
  "105",
  "108",
  "111",
  "113",
  "115",
  "117",
  "119",
];
const KNOWLEDGE_LABELS = ["33", "36", "45", "48", "55", "58", "95", "122"];
const SKILL_LABELS = [
  "70",
  "73",
  "76",
  "79",
  "82",
  "85",
  "88",
  "97.1",
  "123",
  "124",
  "125",
  "126",
  "127",
];

const BELIEF_LABELS = [
  "6",
  "9",
  "12",
  "15",
  "18",
  "21",
  "24",
  "27",
  "30",
  "31.1",
  "31.2",
  "31.3",
  "51.1",
  "51.2",
  "51.3",
];
const CONFIDENCE_LABELS = [
  "59",
  "65",
  "68",
  "71",
  "74",
  "77",
  "80",
  "83",
  "106",
];
const COMMITMENT_LABELS = [
  "34",
  "37",
  "43",
  "46",
  "49",
  "53",
  "56",
  "100",
  "103",
];
const MOTIVATION_LABELS = [
  "19",
  "52",
  "86",
  "89",
  "91",
  "93",
  "96",
  "97.2",
  "109",
];

const LEADERSHIP_LABELS = [
  "1",
  "4",
  "7",
  "10",
  "13",
  "16",
  "22",
  "25",
  "94",
  "98",
  "101",
  "104",
];
const ORGANIZATION_LABELS = [
  "28",
  "32",
  "35",
  "38",
  "41",
  "44",
  "47",
  "50",
  "54",
  "57",
  "60",
  "62",
  "63",
  "66",
  "69",
  "97.3",
  "107",
  "110",
  "112",
  "114",
];
const PEOPLE_LABELS = [
  "72",
  "75",
  "78",
  "81",
  "84",
  "87",
  "90",
  "92",
  "116",
  "118",
  "120",
];

const DIRECTIVE_NON_DIRECTIVE_LABELS = [
  "3",
  "23",
  "26",
  "29",
  "39",
  "40",
  "42",
  "61",
  "64",
  "67",
  "121",
];

export interface PerceivedActual {
  whatTheyThinkTotal: number;
  whatTheyThinkPercent: number;
  whereTheyAreTotal: number;
  whereTheyArePercent: number;
}

export interface SkillsComposite {
  behavior: number;
  knowledge: number;
  skill: number;
  total: number;
  percent: number;
}

export interface WillComposite {
  belief: number;
  confidence: number;
  commitment: number;
  motivation: number;
  total: number;
  percent: number;
}

export interface EnvSupportComposite {
  leadership: number;
  organization: number;
  people: number;
  total: number;
  percent: number;
}

export interface DirectiveNonDirectiveComposite {
  total: number;
  percent: number;
}

export interface Composites {
  skills: SkillsComposite;
  will: WillComposite;
  environmentalSupport: EnvSupportComposite;
  directiveNonDirective: DirectiveNonDirectiveComposite;
}

export function computePerceivedActual(
  answers: Record<string, number>,
): PerceivedActual {
  const whatTheyThinkTotal = sumByLabels(answers, PERCEIVED_LABELS);
  const whereTheyAreTotal = sumByLabels(answers, ACTUAL_LABELS);
  return {
    whatTheyThinkTotal,
    whatTheyThinkPercent: round2((whatTheyThinkTotal / 37) * 10),
    whereTheyAreTotal,
    whereTheyArePercent: round2((whereTheyAreTotal / 9) * 10),
  };
}

export function computeComposites(answers: Record<string, number>): Composites {
  const behavior = round2(sumByLabels(answers, BEHAVIOR_LABELS) / 16);
  const knowledge = round2(sumByLabels(answers, KNOWLEDGE_LABELS) / 8);
  const skill = round2(sumByLabels(answers, SKILL_LABELS) / 13);
  const skillsPercent = round2(((behavior + knowledge + skill) / 30) * 100);

  const belief = round2(sumByLabels(answers, BELIEF_LABELS) / 15);
  const confidence = round2(sumByLabels(answers, CONFIDENCE_LABELS) / 9);
  const commitment = round2(sumByLabels(answers, COMMITMENT_LABELS) / 9);
  const motivation = round2(sumByLabels(answers, MOTIVATION_LABELS) / 9);
  const willPercent = round2(((belief + confidence + commitment + motivation) / 40) * 100);

  const leadership = round2(sumByLabels(answers, LEADERSHIP_LABELS) / 12);
  const organization = round2(sumByLabels(answers, ORGANIZATION_LABELS) / 20);
  const people = round2(sumByLabels(answers, PEOPLE_LABELS) / 11);
  const envPercent = round2(((leadership + organization + people) / 30) * 100);

  const dndTotal = sumByLabels(answers, DIRECTIVE_NON_DIRECTIVE_LABELS);
  const dndPercent = round2((dndTotal / 11) * 10);

  return {
    skills: {
      behavior,
      knowledge,
      skill,
      total: behavior + knowledge + skill,
      percent: skillsPercent,
    },
    will: {
      belief,
      confidence,
      commitment,
      motivation,
      total: belief + confidence + commitment + motivation,
      percent: willPercent,
    },
    environmentalSupport: {
      leadership,
      organization,
      people,
      total: leadership + organization + people,
      percent: envPercent,
    },
    directiveNonDirective: {
      total: dndTotal,
      percent: dndPercent,
    },
  };
}
