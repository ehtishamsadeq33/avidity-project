export interface CandidateInfo {
  name?: string;
  gender?: string;
  age?: string | number;
  yearsInOrganization?: string | number;
  yearsInPosition?: string | number;
}

export interface PerceivedActual {
  whatTheyThinkPercent?: number;
  whereTheyArePercent?: number;
}

export interface CompositeBlock {
  percent?: number;
  [key: string]: number | undefined;
}

export interface Composites {
  skills?: CompositeBlock;
  will?: CompositeBlock;
  environmentalSupport?: CompositeBlock;
  directiveNonDirective?: CompositeBlock;
}

export interface GroupAverages {
  groupSkills: number | null;
  groupWill: number | null;
  groupEnvironmentalSupport: number | null;
  total: number;
}

export interface CandidateRow {
  name: string;
  preSkills: number | null;
  postSkills: number | null;
  preWill: number | null;
  postWill: number | null;
  preEnv: number | null;
  postEnv: number | null;
  preTotal: number | null;
  postTotal: number | null;
  preSkillRating: number | null;
  postSkillRating: number | null;
  preDN: number | null;
  postDN: number | null;
}

// ── helpers ───────────────────────────────────────────────────────────────

const SCORE_COLORS = [
  "#f2ec34",
  "#fec43c",
  "#f18530",
  "#ea2d2d",
  "#d31e5f",
  "#db457a",
  "#0e70a8",
  "#3a99be",
  "#45975d",
  "#77c51a",
];

function pct(v: number | undefined | null): string {
  if (v == null) return "—";
  return `${Math.round(Number(v))}%`;
}

function delta(
  pre: number | undefined | null,
  post: number | undefined | null,
): string {
  if (pre == null || post == null) return "—";
  if (Number(pre) === 0) return "—";
  const d = Math.round(((Number(post) - Number(pre)) / Number(pre)) * 100);
  return d > 0 ? `+${d}%` : `${d}%`;
}

function deltaColor(
  pre: number | undefined | null,
  post: number | undefined | null,
): string {
  if (pre == null || post == null) return "#888888";
  const d =
    Number(pre) !== 0 ? ((Number(post) - Number(pre)) / Number(pre)) * 100 : 0;
  if (d > 0) return "#2e8b44";
  if (d < 0) return "#c62828";
  return "#888888";
}

function bar(percent: number, color: string): string {
  const p = Math.min(Math.max(Math.round(Number(percent) || 0), 1), 99);
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
    <tr>
      <td width="${p}%" style="background-color:${color};height:22px;border-radius:6px 0 0 6px;vertical-align:middle;padding-left:6px;">
        <span style="color:#fff;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">${Math.round(percent)}%</span>
      </td>
      <td width="${100 - p}%" style="background-color:#e8e8e8;height:22px;border-radius:0 6px 6px 0;"></td>
    </tr>
  </table>`;
}

function subBar(value: number, color: string, label: string): string {
  const p = Math.round((Math.min(Math.max(value, 0), 10) / 10) * 100);
  return `<tr>
    <td style="width:100px;font-size:20px;font-weight:bold;font-family:Arial,sans-serif;color:#333;padding:2px 6px 2px 0;vertical-align:middle;">${label}</td>
    <td style="vertical-align:middle;padding:2px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td width="${p}%" style="background-color:${color};height:18px;border-radius:3px 0 0 3px;vertical-align:middle;padding-left:4px;">
            <span style="font-size:20px;font-weight:bold;font-family:Arial,sans-serif;color:#fff;">${value != null ? value.toFixed(1) : "—"}</span>
          </td>
          <td width="${100 - p}%" style="background-color:#f0f0f0;height:18px;border-radius:0 3px 3px 0;"></td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function pill(bg: string, text: string): string {
  return `<span style="display:inline-block;background-color:${bg};color:#fff;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;border-radius:12px;padding:4px 12px;">${text}</span>`;
}

function deltaCell(
  pre: number | undefined | null,
  post: number | undefined | null,
): string {
  const d = delta(pre, post);
  const c = deltaColor(pre, post);
  return `<td style="text-align:center;vertical-align:middle;font-size:20px;font-weight:bold;font-family:Arial,sans-serif;color:${c};">${d}</td>`;
}

function sectionTitle(title: string, color: string): string {
  return `<div style="background-color:${color};color:#fff;font-weight:bold;font-size:25px;font-family:Arial,sans-serif;padding:10px 14px;border-radius:8px;margin:14px 0 8px 0;">${title}</div>`;
}
function sectionTitle1(title: string, color: string): string {
  return `<div style="background-color:${color};color:#fff;font-weight:bold;font-size:25px;font-family:Arial,sans-serif;padding:10px 14px;border-radius:8px;margin:14px 0 8px 0;">${title}</div>`;
}

function circleScore(score: number | undefined | null, color: string): string {
  if (score == null)
    return `<div style="width:40px;height:40px;border-radius:50%;background-color:#ddd;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;font-family:Arial,sans-serif;color:#555;">—</div>`;
  return `<div style="width:40px;height:40px;border-radius:50%;background-color:${color};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;font-family:Arial,sans-serif;color:#fff;">${Math.round(Number(score))}</div>`;
}

function barWithChange(
  label: string,
  aVal: number | undefined | null,
  bVal: number | undefined | null,
  color: string,
  aColor: string,
  bColor: string,
): string {
  const d =
    aVal != null && bVal != null && Number(aVal) !== 0
      ? Math.round(((Number(bVal) - Number(aVal)) / Number(aVal)) * 100)
      : null;
  const dc =
    d != null ? (d > 0 ? "#2e8b44" : d < 0 ? "#c62828" : "#888") : "#888";
  const ds = d != null ? (d > 0 ? `▲ +${d}` : d < 0 ? `▼ ${d}` : "→ 0") : "—";
  return `<tr style="border-bottom:1px solid #eee;">
    <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:3px 8px 3px 0;vertical-align:middle;font-weight:bold;">${label}</td>
    <td style="vertical-align:middle;padding:3px 4px;">${bar(Number(aVal ?? 0) * 10, color)}</td>
    <td style="vertical-align:middle;padding:3px 4px;">${bar(Number(bVal ?? 0) * 10, color)}</td>
    <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;font-weight:bold;color:${dc};padding:3px 8px;">${ds}</td>
  </tr>`;
}

function makePieChart(
  scores: Record<string, number>,
  label: string,
  color: string,
): string {
  const safeScores = scores && typeof scores === "object" ? scores : {};
  const total = Object.values(safeScores).reduce(
    (sum, v) => sum + Number(v || 0),
    0,
  );
  if (!total) {
    return `
      <div style="width:48%;display:inline-block;text-align:center;vertical-align:top;">
        <div style="font-size:20px;font-weight:bold;margin-bottom:8px;color:${color};font-family:Arial,sans-serif;">${label} Pie Chart</div>
        <div style="width:140px;height:140px;border-radius:50%;background:#ddd;margin:0 auto;"></div>
        <div style="margin-top:8px;font-size:20px;color:#666;font-family:Arial,sans-serif;">No data available</div>
      </div>`;
  }
  let cumulative = 0;
  const segments = Object.entries(safeScores)
    .filter(([, v]) => Number(v) > 0)
    .map(([score, count]) => {
      const value = (Number(count) / total) * 100;
      const start = cumulative;
      cumulative += value;
      const end = cumulative;
      const idx = Math.max(Math.min(parseInt(score, 10) - 1, 9), 0);
      const bg = SCORE_COLORS[idx];
      return `${bg} ${start}% ${end}%`;
    })
    .join(",");
  const legend = Object.entries(safeScores)
    .filter(([, v]) => Number(v) > 0)
    .map(([score, count]) => {
      const idx = Math.max(Math.min(parseInt(score, 10) - 1, 9), 0);
      const bg = SCORE_COLORS[idx];
      const spread = ((Number(count) / total) * 100).toFixed(1);
      return `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;font-size:20px;font-family:Arial,sans-serif;">
          <div style="width:10px;height:10px;background:${bg};border-radius:2px;"></div>
          <span>Score ${score} (${spread}%)</span>
        </div>`;
    })
    .join("");
  return `
    <div style="width:48%;display:inline-block;text-align:center;vertical-align:top;">
      <div style="font-size:20px;font-weight:bold;margin-bottom:10px;color:${color};font-family:Arial,sans-serif;">${label} CRA Pie Chart</div>
      <div style="width:160px;height:160px;border-radius:50%;margin:0 auto 12px auto;background:conic-gradient(${segments});border:4px solid #fff;box-shadow:0 0 0px rgba(0,0,0,0.15);"></div>
      <div style="text-align:left;display:inline-block;">${legend}</div>
    </div>`;
}

function getSkillsVsWill(skillsPct: number, willPct: number) {
  const diff = Math.abs(skillsPct - willPct);
  if (diff <= 5) {
    const title = "Skills are equal or close to Will";
    const statement =
      skillsPct >= 70 || willPct >= 70
        ? "The candidate's abilities and knowledge in coaching are equal to their motivation, belief, confidence, and commitment. This balance suggests a well-rounded approach to coaching, as the candidate can leverage both their skills and their will to achieve effective coaching outcomes."
        : "The candidate's coaching abilities and motivation are equally limited. This, while balanced, reflects a need for foundational development on both fronts. Without sufficient skill or internal drive, coaching effectiveness is unlikely to emerge. Support should focus on building core knowledge while simultaneously working to inspire commitment and belief in their coaching potential.";
    return { symbol: "=", title, statement };
  }
  if (skillsPct > willPct) {
    const title = "Skills are higher than Will";
    const statement =
      skillsPct > 70 && willPct > 70
        ? "The candidate has strong abilities and knowledge in coaching, but may lack motivation, belief, confidence, or commitment to coach at their best. They may benefit from help in identifying personal and professional goals that inspire and increase their will to coach. Providing additional resources such as working with a mentor or coach for guidance and support to increase their will could lead to more effective coaching outcomes."
        : "The candidate possesses stronger coaching capabilities than motivation or belief in their ability to coach. Despite having the technical know-how, their lack of will may hinder action and impact. Focus on reigniting their internal motivation by aligning coaching with meaningful personal or professional goals and offering encouragement through coaching communities or mentors.";
    return { symbol: ">", title, statement };
  }
  const title = "Skills are lower than Will";
  const statement =
    skillsPct > 70 && willPct > 70
      ? "The candidate demonstrates commendable motivation, confidence, and commitment to coach, but may need further training or knowledge development to fully realize their coaching potential. Enroll them in coach training programs to expand their knowledge and seek opportunities for them to apply coaching skills in practical settings. Partner them with skilled coaches for best practices and insights."
      : "Despite showing strong motivation to coach, the candidate lacks the skills to act effectively. This can lead to discouragement over time. Providing foundational coaching education, feedback-rich experiences, and support through skilled coaching partners will help build confidence and accelerate development.";
  return { symbol: "<", title, statement };
}

function getWillVsEnv(willPct: number, envPct: number) {
  const diff = Math.abs(willPct - envPct);
  if (diff <= 5) {
    const title = "Will is equal or close to Environmental Support";
    const statement =
      willPct >= 70 || envPct >= 70
        ? "The candidate's personal drive and commitment to coaching are equal with the level of support they receive from their environment. This balance can contribute to a positive coaching experience, as the candidate can thrive with both intrinsic motivation and external support."
        : "The candidate's motivation and the support they receive are equally insufficient, which may result in disengagement or lack of initiative in coaching. Even if the individual sees the value in coaching, the lack of environmental reinforcement or personal drive could stall growth. Interventions should include creating visible support systems while cultivating personal investment in coaching success.";
    return { symbol: "=", title, statement };
  }
  if (willPct > envPct) {
    const title = "Will is higher than Environmental Support";
    const statement =
      willPct > 70 && envPct > 70
        ? "The candidate's personal drive and commitment to coach are commendable, but they may lack adequate support to thrive as a coach in their environment. This deficiency could affect their morale and overall coaching performance over time. The organization and its members should provide additional support to the candidate, focusing on fostering a coaching culture that aligns with candidate's goals."
        : willPct > 70 && envPct < 70
          ? "The candidate has commendable personal drive but lacks the external conditions needed to thrive. This imbalance may lead to frustration or burnout. The organization should work to close this gap by ensuring coaching is recognized, supported, and embedded in culture and leadership practice, providing platforms and tools to support their coaching efforts."
          : "The candidate is experiencing low personal motivation alongside minimal external support. This combination can severely restrict their ability to engage in coaching or see its relevance. Without a spark of internal drive or a nurturing environment, coaching is unlikely to take root. Interventions should aim to inspire the candidate, help them find personal meaning in coaching, while simultaneously improving the organizational climate with accessible support systems.";
    return { symbol: ">", title, statement };
  }
  const title = "Will is lower than Environmental Support";
  const statement =
    willPct > 70 && envPct > 70
      ? "The candidate receives substantial support from their environment to thrive as a coach, but may need to boost their motivation, confidence, or belief to fully capitalize on that support. They could benefit from working with a mentor or coach to establish personal and professional goals that inspire them. Increasing their will through tailored coaching support can enhance their performance and overall success."
      : willPct < 70 && envPct > 70
        ? "The candidate is surrounded by encouraging structures but struggles to find the internal drive to coach. Without addressing this, even the best resources may go unused. Increase personal motivation by helping the candidate uncover their purpose for coaching and connect it to professional fulfillment. Small wins can help build momentum and belief."
        : "Despite showing strong motivation to coach, the candidate lacks the skills to act effectively. This can lead to discouragement over time. Providing foundational coaching education, feedback-rich experiences, and support through skilled coaching partners will help build confidence and accelerate development.";
  return { symbol: "<", title, statement };
}

function getEnvVsSkills(envPct: number, skillsPct: number) {
  const diff = Math.abs(envPct - skillsPct);
  if (diff <= 5) {
    const title = "Environmental Support is equal or close to Skills";
    const statement =
      envPct >= 70 || skillsPct >= 70
        ? "The candidate's support from their environment aligns with their level of coaching abilities and knowledge. This balance can facilitate the candidate's growth and performance as a coach, as they can utilize the available resources and opportunities to enhance their skills."
        : "The candidate's current skill and environmental support are equally inadequate, limiting their capacity to coach effectively. This reveals that even if the individual has some interest or potential, both external resources and coaching competence must be developed in tandem. Consider structured learning, early application opportunities, and an improved coaching culture to foster growth.";
    return { symbol: "=", title, statement };
  }
  if (envPct > skillsPct) {
    const title = "Environmental Support is higher than Skills";
    const statement =
      envPct > 70 && skillsPct > 70
        ? "The candidate is benefiting from strong support from their environment that provides them with the motivation and resources to coach. However, they may need to further develop their coaching skills to fully capitalize on this support. To aid in their growth, identify areas of coaching skill improvement and seek targeted interventions. Provide opportunities for hands-on coaching practice and learning, and collaborate with coaches for best practices and insights."
        : envPct > 70 && skillsPct < 70
          ? "Though the environment is conducive to coaching, the candidate may not yet have the skills to make use of this support. They risk missing opportunities if their coaching capabilities are not developed. Address this gap by providing targeted training, hands-on experiences, and access to experienced coaches who can support their progression."
          : "The candidate lacks both the capabilities required for coaching and the environmental structures to support their development. This creates a significant barrier to progress, as neither individual readiness nor external conditions are present. The focus should be on building foundational coaching knowledge in a psychologically safe and encouraging environment. Provide structured, bite-sized learning, regular check-ins, and a strong community of practice to slowly shift both capability and culture.";
    return { symbol: ">", title, statement };
  }
  const title = "Environmental Support is lower than Skills";
  const statement =
    envPct > 70 && skillsPct > 70
      ? "The candidate has the necessary knowledge of coaching skills, but may not be receiving sufficient support from their environment to thrive as a coach, which could negatively affect their morale and performance over time. The organization should enhance support for the candidate, potentially by strengthening the coaching culture and aligning it with the candidate's goals to ensure their long-term success as a coach."
      : envPct < 70 && skillsPct > 70
        ? "The candidate has coaching capabilities but is not adequately supported by their environment. This lack of alignment may lead to decreased morale or underutilized potential. Organizations should bolster the support system, through leadership buy-in, time allocation, or peer networks, so that the candidate can thrive and remain committed to their growth as a coach."
        : "Despite showing strong motivation to coach, the candidate lacks the skills to act effectively. This can lead to discouragement over time. Providing foundational coaching education, feedback-rich experiences, and support through skilled coaching partners will help build confidence and accelerate development.";
  return { symbol: "<", title, statement };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FUNCTION — Group-level Pre vs Post combined report
// ─────────────────────────────────────────────────────────────────────────────

export function generateCombinedGroupReportHTML(
  candidateInfo: CandidateInfo,
  perceivedActual: PerceivedActual,
  composites: Composites,
  scores: Record<string, number>,
  logoBase64: string = "",
  groupAverages?: GroupAverages | null,
  quoteImageBase64: string = "",
  cardImagesBase64: string[] = [],
  chartImageBase64: string = "",
  candidatesList: CandidateRow[] = [],
  groupNameLabel: string = "",
  postComposites?: Composites,
  postPerceivedActual?: PerceivedActual,
  postScores?: Record<string, number>,
  actualskillsImageBase64: string = "",
  CompositeImageBase64: string = "",
  CRAImageBase64: string = "",
  CompareImageBase64: string = "",
): string {
  // ── PRE values ────────────────────────────────────────────
  const aSkills = Number(composites.skills?.percent ?? 0);
  const aWill = Number(composites.will?.percent ?? 0);
  const aEnv = Number(composites.environmentalSupport?.percent ?? 0);
  const aDn = Number(composites.directiveNonDirective?.percent ?? 0);
  const aCRA =
    Math.round(((aSkills * 1.3 + aWill * 1.45 + aEnv * 1.25) / 4) * 10) / 10;

  // ── POST values ─────────────────────────────────────────
  const bSkills = Number(postComposites?.skills?.percent ?? 0);
  const bWill = Number(postComposites?.will?.percent ?? 0);
  const bEnv = Number(postComposites?.environmentalSupport?.percent ?? 0);
  const bDn = Number(postComposites?.directiveNonDirective?.percent ?? 0);
  const bCRA =
    Math.round(((bSkills * 1.3 + bWill * 1.45 + bEnv * 1.25) / 4) * 10) / 10;

  const aLabel = "PRE";
  const bLabel = "POST";
  const aColor = "#2e8b44";
  const bColor = "#3730a3";

  const displayName = candidateInfo.name || "Group";

  const formatDate = (s: string) => {
    if (!s) return "—";
    const d = new Date(s);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ── Logo block ──────────────────────────────────────────
  const logoBlock = `

    <div style="padding:0;text-align:right;margin-bottom:16px;margin-top:-14px;margin-right:-14px;margin-left:-14px;border-radius:8px;">
      ${
        logoBase64 && logoBase64.length > 100
          ? `<img src="${logoBase64}" style="max-width:1000px;max-height:200px;object-fit:contain;display:block;margin-left:auto;margin-right:0;" />`
          : `<p style="color:#f5c842;font-size:22px;font-weight:bold;font-family:Arial,sans-serif;margin:0;letter-spacing:2px;">avidity<span style="color:#ffffff;">®</span> international</p>`
      }
    </div>`;

  const header = `
    <div style="padding:0;margin:0;text-align:center;border-radius:8px;">
      <div style="display:flex;justify-content:center;align-items:center;margin-top:-10;padding-top:0;">${logoBlock}</div>
      <p style="color:#f5c842;font-size:20px;font-weight:bold;font-family:Arial,sans-serif;margin:14px 0;letter-spacing:1px;text-align:center;">COACH READINESS ASSESSMENT — GROUP PRE vs POST COMPARISON</p>
    </div>`;

  const comparisonBanner = `<p style="color:#ffeb00;font-size:20px;font-weight:bold;font-family:Arial,sans-serif;margin:0 0 14px 0;letter-spacing:1px;text-align:center;">COACH READINESS ASSESSMENT — GROUP PRE vs POST COMPARISON</p>`;

  // ── Info table ──────────────────────────────────────────
  const infoTable = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:2px solid #f5c842;border-radius:15px;background-color:#fffde7;margin-bottom:12px;">
      <tr style="background-color:#f5c842;margin-top:10px;">
        
      </tr>
      <tr>
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;"><b>Group Name</b></td>
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;text-align:center;" colspan="2">${displayName}</td>
      </tr>
      <tr style="background-color:#fff9e6;">
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;"><b>Total Candidates</b></td>
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;text-align:center;">${candidatesList.length}</td>
      </tr>
      
    </table>`;

  // ── CRA table ─────────────────────────────────────────
  const CRA = `

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:4px;">
      <tr>
        <td style="width:30%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;padding-bottom:4px;"></td>
        <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${aColor};padding-bottom:4px;padding-left:4px;">${aLabel}</td>
        <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${bColor};padding-bottom:4px;padding-left:4px;">${bLabel}</td>
        <td style="width:14%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;text-align:center;padding-bottom:4px;"></td>
      </tr>
      ${[{ label: "Total CRA Score", aVal: aCRA, bVal: bCRA, color: "#666" }]
        .map((r) => {
          const d =
            r.aVal != null && r.bVal != null && Number(r.aVal) !== 0
              ? Math.round(
                  ((Number(r.bVal) - Number(r.aVal)) / Number(r.aVal)) * 100,
                )
              : null;
          const dc =
            d != null
              ? d > 0
                ? r.label === "Directive / Non-Directive"
                  ? "#c62828"
                  : "#2e8b44"
                : d < 0
                  ? r.label === "Directive / Non-Directive"
                    ? "#2e8b44"
                    : "#c62828"
                  : "#888"
              : "#888";
          const ds =
            d != null ? (d > 0 ? `▲ +${d}` : d < 0 ? `▼ ${d}` : "→ 0") : "—";
          return `
          <tr>
            <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:3px 8px 3px 0;vertical-align:middle;font-weight:bold;">${r.label}</td>
            <td style="vertical-align:middle;padding:3px 4px;">${bar(Number(r.aVal ?? 0) <= 10 ? Number(r.aVal ?? 0) * 10 : Number(r.aVal ?? 0), r.color)}</td>
            <td style="vertical-align:middle;padding:3px 4px;">${bar(Number(r.bVal ?? 0) <= 10 ? Number(r.bVal ?? 0) * 10 : Number(r.bVal ?? 0), r.color)}</td>
            <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;font-weight:bold;color:${dc};padding:3px 4px;">${ds}</td>
          </tr>`;
        })
        .join("")}
    </table>`;

  // ── Summary table ─────────────────────────────────────────
  const summaryTable = `

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:4px;">
      <tr>
        <td style="width:30%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;padding-bottom:4px;"></td>
        <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${aColor};padding-bottom:4px;padding-left:4px;">${aLabel}</td>
        <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${bColor};padding-bottom:4px;padding-left:4px;">${bLabel}</td>
        <td style="width:14%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;text-align:center;padding-bottom:4px;"></td>
      </tr>
      ${[
        { label: "Skills", aVal: aSkills, bVal: bSkills, color: "#4caf50" },
        { label: "Will", aVal: aWill, bVal: bWill, color: "#ff9800" },
        {
          label: "Environmental Support",
          aVal: aEnv,
          bVal: bEnv,
          color: "#9c27b0",
        },
        {
          label: "Directive / Non-Directive",
          aVal: aDn,
          bVal: bDn,
          color: "#1565c0",
          invertDelta: true,
        },
      ]
        .map((r) => {
          const d =
            r.aVal != null && r.bVal != null && Number(r.aVal) !== 0
              ? Math.round(
                  ((Number(r.bVal) - Number(r.aVal)) / Number(r.aVal)) * 100,
                )
              : null;
          const dc =
            d != null
              ? d > 0
                ? r.label === "Directive / Non-Directive"
                  ? "#c62828"
                  : "#2e8b44"
                : d < 0
                  ? r.label === "Directive / Non-Directive"
                    ? "#2e8b44"
                    : "#c62828"
                  : "#888"
              : "#888";
          const ds =
            d != null ? (d > 0 ? `▲ +${d}` : d < 0 ? `▼ ${d}` : "→ 0") : "—";
          return `
          <tr>
            <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:3px 8px 3px 0;vertical-align:middle;font-weight:bold;">${r.label}</td>
            <td style="vertical-align:middle;padding:3px 4px;">${bar(Number(r.aVal ?? 0) <= 10 ? Number(r.aVal ?? 0) * 10 : Number(r.aVal ?? 0), r.color)}</td>
            <td style="vertical-align:middle;padding:3px 4px;">${bar(Number(r.bVal ?? 0) <= 10 ? Number(r.bVal ?? 0) * 10 : Number(r.bVal ?? 0), r.color)}</td>
            <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;font-weight:bold;color:${dc};padding:3px 4px;">${ds}</td>
          </tr>`;
        })
        .join("")}
    </table>`;

  // ── Pie charts ──────────────────────────────────────────
  const scorePieCharts = `

      <!-- Image -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;margin-top:-15px;margin-bottom:12px;">
        <tr>
          <td style="padding:0;">
            <img src="${CRAImageBase64}"
                 style="width:100%;max-height:180px;object-fit:contain;display:block;" />
          </td>
        </tr>
      </table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffeb00;border-radius:10px;margin-top:0px;margin-bottom:-0px;">
        <tr><td style="padding:4px 6px;background-color:#f5c842;border-radius:10px;">
          <p style="font-size:20px;font-family:Arial,sans-serif;color:#000;margin:0;line-height:1.4;">This chart illustrates the percentage of scores chosen by candidates on a scale of 1 to 10 from all <b>133</b> statement responses in the Coach Readiness Assessment. Each slice represents how often a particular score was selected.</p>
        </td></tr>
      </table>
    <div style="width:100%;display:flex;justify-content:space-between;gap:12px;margin-bottom:16px;">
      ${makePieChart(scores || {}, aLabel, aColor)}
      ${makePieChart(postScores || {}, bLabel, bColor)}
    </div>`;

  // ── Candidate table ─────────────────────────────────────
  const ppFmt = (v: number | null): string => {
    if (v == null) return "—";
    return (v / 10).toFixed(1);
  };
  const ppFmtPct = (v: number | null): string => {
    if (v == null) return "—";
    return `${v.toFixed(1)}%`;
  };
  const ppFmtPct1 = (v: number | null): string => {
    if (v == null) return "—";
    return `${v.toFixed(1)}`;
  };

  const candidateTable = `
    ${sectionTitle("Candidate Pre vs Post Results", "#f5c842")}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:20px;margin-top:-5px;margin-bottom:2px;">
      <thead>
        <tr>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#2c2c2c;text-align:center;background-color:#f5c842;">#</td>
          <td style="padding:3px 5px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#2c2c2c;background-color:#fffde7;">${groupNameLabel || "Candidate"}</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#e8f5e9;">Skills Pre</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#e8f5e9;">Skills Post</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#fff3e0;">Will Pre</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#fff3e0;">Will Post</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#f3e5f5;">Env Pre</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#f3e5f5;">Env Post</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#fff8e1;">Skill Rating Pre</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#fff8e1;">Skill Rating Post</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#fce4ec;">D/N Pre</td>
          <td style="padding:3px;font-weight:bold;font-size:10px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#fce4ec;">D/N Post</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#e0f7fa;">Total Pre</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#e0f7fa;">Total Post</td>
        </tr>
      </thead>
      <tbody>
        ${candidatesList
          .map(
            (c, i) => `
          <tr style="border-bottom:1px solid #e0e0e0;">
            <td style="padding:2px 3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#2c2c2c;text-align:center;background-color:#f5c842;">${i + 1}</td>
            <td style="padding:2px 5px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#2c2c2c;background-color:#fffde7;">${c.name}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#4caf50;text-align:center;">${ppFmt(c.preSkills)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#4caf50;text-align:center;">${ppFmt(c.postSkills)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#ff9800;text-align:center;">${ppFmt(c.preWill)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#ff9800;text-align:center;">${ppFmt(c.postWill)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#9c27b0;text-align:center;">${ppFmt(c.preEnv)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#9c27b0;text-align:center;">${ppFmt(c.postEnv)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#f57f17;text-align:center;">${ppFmtPct1(c.preSkillRating)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#f57f17;text-align:center;">${ppFmtPct1(c.postSkillRating)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#c62828;text-align:center;">${ppFmt(c.preDN)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#c62828;text-align:center;">${ppFmt(c.postDN)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;">${ppFmtPct(c.preTotal)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;">${ppFmtPct(c.postTotal)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>`;

  // ── Sub-dimension bars ────────────────────────────────────
  const makeBarsSection = (
    title: string,
    titleColor: string,
    rows: Array<{
      label: string;
      aVal: number | undefined;
      bVal: number | undefined;
      color: string;
      invertDelta?: boolean;
    }>,
  ) => `
    ${sectionTitle(title, titleColor)}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top;-5px;margin-bottom:2px;">
      <tr>
        <td style="width:30%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;padding-bottom:2px;"></td>
        <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${aColor};padding-bottom:2px;padding-left:4px;">${aLabel}</td>
        <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${bColor};padding-bottom:2px;padding-left:4px;">${bLabel}</td>
        <td style="width:14%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;text-align:center;padding-bottom:2px;"></td>
      </tr>
      ${rows
        .map((r) => {
          const d =
            r.aVal != null && r.bVal != null && Number(r.aVal) !== 0
              ? Math.round(
                  ((Number(r.bVal) - Number(r.aVal)) / Number(r.aVal)) * 100,
                )
              : null;
          const dc =
            d != null
              ? d > 0
                ? r.invertDelta
                  ? "#c62828"
                  : "#2e8b44"
                : d < 0
                  ? r.invertDelta
                    ? "#2e8b44"
                    : "#c62828"
                  : "#888"
              : "#888";
          const ds =
            d != null ? (d > 0 ? `▲ +${d}` : d < 0 ? `▼ ${d}` : "→ 0") : "—";
          return `
          <tr>
            <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:3px 8px 3px 0;vertical-align:middle;font-weight:bold;">${r.label}</td>
            <td style="vertical-align:middle;padding:3px 4px;">${bar(Number(r.aVal ?? 0) <= 10 ? Number(r.aVal ?? 0) * 10 : Number(r.aVal ?? 0), r.color)}</td>
            <td style="vertical-align:middle;padding:3px 4px;">${bar(Number(r.bVal ?? 0) <= 10 ? Number(r.bVal ?? 0) * 10 : Number(r.bVal ?? 0), r.color)}</td>
            <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;font-weight:bold;color:${dc};padding:3px 4px;">${ds}</td>
          </tr>`;
        })
        .join("")}
    </table>`;
  const makeBarsSection1 = (
    title: string,
    titleColor: string,
    rows: Array<{
      label: string;
      aVal: number | undefined;
      bVal: number | undefined;
      color: string;
    }>,
  ) => `

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top;-5px;margin-bottom:2px;">
      <tr>
        <td style="width:30%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;padding-bottom:2px;"></td>
        <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${aColor};padding-bottom:2px;padding-left:4px;">${aLabel}</td>
        <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${bColor};padding-bottom:2px;padding-left:4px;">${bLabel}</td>
        <td style="width:14%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;text-align:center;padding-bottom:2px;"></td>
      </tr>
      ${rows
        .map((r) => {
          const d =
            r.aVal != null && r.bVal != null && Number(r.aVal) !== 0
              ? Math.round(
                  ((Number(r.bVal) - Number(r.aVal)) / Number(r.aVal)) * 100,
                )
              : null;
          const dc =
            d != null
              ? d > 0
                ? "#2e8b44"
                : d < 0
                  ? "#c62828"
                  : "#888"
              : "#888";
          const ds =
            d != null ? (d > 0 ? `▲ +${d}` : d < 0 ? `▼ ${d}` : "→ 0") : "—";
          return `
          <tr>
            <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:3px 8px 3px 0;vertical-align:middle;font-weight:bold;">${r.label}</td>
            <td style="vertical-align:middle;padding:3px 4px;">${bar(Number(r.aVal ?? 0) <= 10 ? Number(r.aVal ?? 0) * 10 : Number(r.aVal ?? 0), r.color)}</td>
            <td style="vertical-align:middle;padding:3px 4px;">${bar(Number(r.bVal ?? 0) <= 10 ? Number(r.bVal ?? 0) * 10 : Number(r.bVal ?? 0), r.color)}</td>
            <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;font-weight:bold;color:${dc};padding:3px 4px;">${ds}</td>
          </tr>`;
        })
        .join("")}
    </table>`;

  const SkillbarsPage = makeBarsSection("Skills Sub-dimensions", "#4caf50", [
    {
      label: "Knowledge",
      aVal: composites.skills?.knowledge,
      bVal: postComposites?.skills?.knowledge,
      color: "#4caf50",
    },
    {
      label: "Behavior",
      aVal: composites.skills?.behavior,
      bVal: postComposites?.skills?.behavior,
      color: "#66bb6a",
    },
    {
      label: "Skill",
      aVal: composites.skills?.skill,
      bVal: postComposites?.skills?.skill,
      color: "#81c784",
    },
  ]);

  const WillbarsPage = makeBarsSection("Will ", "#ff9800", [
    {
      label: "Motivation",
      aVal: composites.will?.motivation,
      bVal: postComposites?.will?.motivation,
      color: "#ff9800",
    },
    {
      label: "Belief",
      aVal: composites.will?.belief,
      bVal: postComposites?.will?.belief,
      color: "#ffa726",
    },
    {
      label: "Confidence",
      aVal: composites.will?.confidence,
      bVal: postComposites?.will?.confidence,
      color: "#ffb74d",
    },
    {
      label: "Commitment",
      aVal: composites.will?.commitment,
      bVal: postComposites?.will?.commitment,
      color: "#ffcc02",
    },
  ]);

  const EnvbarsPage = makeBarsSection("Environmental Support ", "#9c27b0", [
    {
      label: "Leadership",
      aVal: composites.environmentalSupport?.leadership,
      bVal: postComposites?.environmentalSupport?.leadership,
      color: "#9c27b0",
    },
    {
      label: "Organization",
      aVal: composites.environmentalSupport?.organization,
      bVal: postComposites?.environmentalSupport?.organization,
      color: "#ab47bc",
    },
    {
      label: "People",
      aVal: composites.environmentalSupport?.people,
      bVal: postComposites?.environmentalSupport?.people,
      color: "#ba68c8",
    },
  ]);

  const directiveBarsPage = makeBarsSection(
    "Directive / Non-Directive",
    "#1565c0",
    [
      {
        label: "Directive / Non-Directive",
        aVal: composites.directiveNonDirective?.percent,
        bVal: postComposites?.directiveNonDirective?.percent,
        color: "#1565c0",
        invertDelta: true,
      },
    ],
  );

  const perceivedActualBars = makeBarsSection1(
    "",
    "",

    [
      {
        label: "What They Think",
        aVal: perceivedActual?.whatTheyThinkPercent,
        bVal: postPerceivedActual?.whatTheyThinkPercent,
        color: "#607d8b",
      },
      {
        label: "Where They Are",
        aVal: perceivedActual?.whereTheyArePercent,
        bVal: postPerceivedActual?.whereTheyArePercent,
        color: "#90a4ae",
      },
    ],
  );

  // ── What do your results mean? ─────────────────────────────
  const skillsVsWill = getSkillsVsWill(aSkills, aWill);
  const willVsEnv = getWillVsEnv(aWill, aEnv);
  const envVsSkills = getEnvVsSkills(aEnv, aSkills);

  const analysisSection = [
    {
      leftLabel: "Skills",
      leftColor: "#2e7d32",
      leftPct: bSkills,
      rightLabel: "Will",
      rightColor: "#e65100",
      rightPct: bWill,
      ...skillsVsWill,
    },
    {
      leftLabel: "Will",
      leftColor: "#e65100",
      leftPct: bWill,
      rightLabel: "Environmental Support",
      rightColor: "#6a1b9a",
      rightPct: bEnv,
      ...willVsEnv,
    },
    {
      leftLabel: "Environmental Support",
      leftColor: "#6a1b9a",
      leftPct: bEnv,
      rightLabel: "Skills",
      rightColor: "#2e7d32",
      rightPct: bSkills,
      ...envVsSkills,
    },
  ]
    .map(
      (c) => `
    <div style="margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:10px;">
        <tr>
          <td width="45%" style="background-color:${c.leftColor};border-radius:25px;padding:10px 14px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="color:#fff;font-weight:bold;font-size:25px;font-family:Arial,sans-serif;">${c.leftLabel}</td>
                <td style="color:#fff;font-weight:bold;font-size:25px;font-family:Arial,sans-serif;text-align:right;">${Math.round(Number(c.leftPct || 0))}%</td>
              </tr>
            </table>
          </td>
          <td width="10%" style="text-align:center;vertical-align:middle;">
            <div style="width:36px;height:36px;background-color:#f5c842;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:25px;font-family:Arial,sans-serif;line-height:36px;text-align:center;">${c.symbol}</div>
          </td>
          <td width="45%" style="background-color:${c.rightColor};border-radius:25px;padding:10px 14px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="color:#fff;font-weight:bold;font-size:25px;font-family:Arial,sans-serif;">${c.rightLabel}</td>
                <td style="color:#fff;font-weight:bold;font-size:25px;font-family:Arial,sans-serif;text-align:right;">${Math.round(Number(c.rightPct || 0))}%</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <div style="background:white;border-radius:12px;padding:14px;box-shadow:0 0px 0px rgba(0,0,0,0.1);">
        <p style="font-weight:bold;text-decoration:underline;text-align:center;font-size:25px;font-family:Arial,sans-serif;margin:0 0 8px 0;">${c.title}</p>
        <p style="font-size:20px;text-align:center;color:#333;line-height:1.6;font-family:Arial,sans-serif;margin:0;">${c.statement}</p>
      </div>
    </div>
  `,
    )
    .join("");

  // ── Return HTML ───────────────────────────────────────────
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>    
    @page { size: 210mm 500mm; margin: 15px 15px 40px 15px; }
    body { font-family: Arial, sans-serif; padding: 14px; background-color: #fffde7; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-break { page-break-after: always; padding-bottom: 20px;max-height: 297mm;}
    .page3-tall { page-break-after: always; padding-bottom: 20px; min-height: 340mm; }

  </style>
</head>
<body>

<!-- ═══════════════ PAGE 1 — INTRO ═══════════════ -->
<div class="page-break">
    <!-- Black header with logo -->
${logoBlock}

  <!-- Description paragraphs -->
  <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.2;margin:0 ;text-align:justify;">
    The Coach Readiness Assessment (CRA) evaluates participants against a set of clearly defined criteria, including skills, motivation, and beliefs, to identify individuals with the attributes needed for successful coaching implementation.
  </p>
  <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.2;margin:0 0 16px 0;text-align:justify;">
    This comprehensive approach helps identify potential roadblocks early, enabling proactive interventions and smoother program implementation.
  </p>

  <!-- Quote block -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:-10px;margin-bottom:30px;">
    <tr>
      <td style="width:4px;border-radius:2px;">&nbsp;</td>
      <td style="padding:10px 14px;">
        ${
          quoteImageBase64 && quoteImageBase64.length > 100
            ? `<img src="${quoteImageBase64}" style="max-width:100%;max-height:180px;object-fit:contain;display:block;margin:0 auto 10px auto;" />`
            : `
              <span style="font-size:24px;color:#f5c842;font-family:Arial,sans-serif;">&ldquo;</span>
              <p style="font-size:12px;font-weight:bold;font-family:Arial,sans-serif;color:#1A1A1A;line-height:1.6;margin:4px 0;">
                The CRA aims to establish a more objective and data-driven approach to selecting participants for people coaching roles within organizations.
              </p>
              <div style="text-align:right;">
                <span style="font-size:24px;color:#f5c842;font-family:Arial,sans-serif;">&rdquo;</span>
              </div>
            `
        }
      </td>

    </tr>
  </table>

  <!-- This report highlights banner -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f5c842;border-radius:25px;margin-top:-15px;margin-bottom:0px;">
    <tr>
      <td style="padding:10px;text-align:center;background-color:#000000;border-radius:25px;">
        <span style="font-weight:bold;font-size:25px;font-family:Arial,sans-serif;color:#ffeb00;">This report highlights:</span>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="5" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:5px;margin-bottom:0;">

  <!-- Card 1 -->
  <tr>
    <td style="vertical-align:top;padding-top:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:0;">
            <img src="${cardImagesBase64[0]}" style="width:100%;max-height:180px;object-fit:contain;display:block;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Card 2 -->
  <tr>
    <td style="vertical-align:top;padding-top:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:0;">
            <img src="${cardImagesBase64[1]}" style="width:100%;max-height180px;object-fit:contain;display:block;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Card 3 -->
  <tr>
    <td style="vertical-align:top;padding-top:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:0;">
            <img src="${cardImagesBase64[2]}" style="width:100%;max-height180px;object-fit:contain;display:block;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Card 4 -->
  <tr>
    <td style="vertical-align:top;padding-top:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:0;">
            <img src="${cardImagesBase64[3]}" style="width:100%;max-height180px;object-fit:contain;display:block;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>


</div>

<!-- ═══════════════ PAGE 2 — GROUP COMPARISON + CANDIDATE TABLE ═══════════════ -->
<div class="page-break">
  <!--${comparisonBanner}-->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f5c842;border-radius:25px;margin-top:5px;margin-bottom:10px;">
      <tr>
        <td style="padding:10px;text-align:center;background-color:#000000;border-radius:25px;">
          <span style="font-weight:bold;font-size:30px;font-family:Arial,sans-serif;color:#ffeb00;">Candidate's Overall Summary</span>
        </td>
      </tr>
    </table>
  ${infoTable}

  <!-- Yellow Box 2: Group Composite Summary -->
    <div style="border:3px solid #f5c842;border-radius:16px;padding:14px;background-color:#fffde7;margin-bottom:14px;">
   
  ${CRA}
  </div>
  
  <!-- Yellow Box 1: Perceived vs Actual -->
  <div style="border:3px solid #f5c842;border-radius:16px;padding:14px;background-color:#fffde7;margin-bottom:14px;">
   <!-- Image -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;margin-top:-15px;margin-bottom:12px;">
        <tr>
          <td style="padding:0;">
            <img src="${actualskillsImageBase64}"
                 style="width:100%;max-height:180px;object-fit:contain;display:block;" />
          </td>
        </tr>
      </table>
    ${perceivedActualBars}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:4px;">
      <tr><td style="padding:3px 6px;background-color:#fffde7;border-left:4px solid #fffde7;border-radius:4px;">
        <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.4;margin:0 0 4px 0;text-align:justify;">The charts above contrast the group's self-assessed coaching skills with objectively measured skills.</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:4px;">
          <tr><td style="width:10px;vertical-align:top;padding-top:1px;"><span style="color:#f5c842;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">•</span></td>
          <td style="padding-left:6px;"><p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.2;margin:0;"><b style="color:#66bb6a;text-align:justify;">What They Think:</b> represents how the group thinks they are in their abilities to coach</p></td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:4px;">
          <tr><td style="width:10px;vertical-align:top;padding-top:1px;"><span style="color:#f5c842;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">•</span></td>
          <td style="padding-left:6px;"><p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.2;margin:0;"><b style="color:#1b5e20;text-align:justify;">Where They Are:</b> represents the group's actual coaching practice based on the assessment</p></td></tr>
        </table>
      </td></tr>
    </table>
  </div>

  <!-- Yellow Box 2: Group Composite Summary -->
  <div style="border:3px solid #f5c842;border-radius:16px;padding:14px;background-color:#fffde7;margin-bottom:14px;">
  <!-- Image -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="border-collapse:collapse;margin-top:-15px;margin-bottom:12px;">
    <tr>
      <td style="padding:0;">
        <img src="${CompositeImageBase64}"
             style="width:100%;max-height:180px;object-fit:contain;display:block;" />
      </td>
    </tr>
  </table>
    ${summaryTable}
  </div>

  <!-- Yellow Box 3: CRA Score Pie Charts -->
  <div style="border:3px solid #f5c842;border-radius:16px;padding:14px;background-color:#fffde7;margin-bottom:14px;">
    ${scorePieCharts}
  </div>
  <!--${candidateTable}-->
</div>

<!-- ═══════════════ PAGE 3 — REPORT PAGE 2 ═══════════════ -->
<div class="page3-tall">
<!-- ${candidateTable} -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f5c842;border-radius:25px;margin-top:5px;margin-bottom:0px;margin-bottom:40px;">
  <tr>
    <td style="padding:10px;text-align:center;background-color:#000000;border-radius:25px;">
      <span style="font-weight:bold;font-size:30px;font-family:Arial,sans-serif;color:#ffeb00;">Detailed Composite Scores</span>
    </td>
  </tr>
</table>
  ${SkillbarsPage}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0;margin-bottom:40px;">
    <tr><td style="padding:2px 4px;">
      <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;font-style:italic;text-align:justify;">
        This section measures the group's core coaching competencies. It evaluates specific skills such as knowledge, practical coaching behaviors, and overall coaching skill.
      </p>
    </td></tr>
  </table>
  ${WillbarsPage}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0;margin-bottom:40px;">
    <tr><td style="padding:2px 4px;">
      <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;font-style:italic;text-align:justify;">
        This section assesses the group's mental preparedness to coach. It includes motivation, confidence, commitment, and personal belief in coaching potential.
      </p>
    </td></tr>
  </table>
  ${EnvbarsPage}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0;margin-bottom:40px;">
    <tr><td style="padding:2px 4px;">
      <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;font-style:italic;text-align:justify;">
        This section evaluates the external factors that influence the group's coaching success. It measures the perceived support provided by people, leadership, and organizational environment.
      </p>
    </td></tr>
  </table>
  ${directiveBarsPage}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0;text-align:justify;margin-bottom:40px;">
    <tr><td style="padding:2px 4px;">
      <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0 0 4px 0;font-style:italic;">This scale distinguishes between:</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:1px;">
        <tr><td style="width:10px;vertical-align:top;padding-top:1px;"><span style="color:#e65100;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">•</span></td>
        <td style="padding-left:6px;"><p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;"><b style="color:#e65100;">Directive Approach:</b> still offers explicit answers and direction</p></td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:1px;">
        <tr><td style="width:10px;vertical-align:top;padding-top:1px;"><span style="color:#2e7d32;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">•</span></td>
        <td style="padding-left:6px;"><p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;"><b style="color:#2e7d32;">Non-Directive Approach:</b> facilitates people to discover solutions</p></td></tr>
      </table>
    </td></tr>
  </table>

</div>

<!-- ═══════════════ PAGE 4 — ANALYSIS ═══════════════ -->
<div style="page-break-before: always; break-before: page; padding-top: 5px;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f5c842;border-radius:25px;margin-top:5px;margin-bottom:10px;">
  <tr>
    <td style="padding:10px;text-align:center;background-color:#000000;border-radius:25px;">
      <span style="font-weight:bold;font-size:30px;font-family:Arial,sans-serif;color:#ffeb00;">What do your results mean?</span>
    </td>
  </tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:2px solid #f5c842;border-radius:15px;background-color:#fffde7;margin-bottom:18px;">
    <tr><td style="padding:10px 14px;">
      <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.6;margin:0 0 8px 0;">
        Coaching success depends on more than skills alone. This section evaluates the balance and interaction between coaching capability (<b style="color:#2e7d32;">Skills</b>), coaching motivation (<b style="color:#e65100;">Will</b>), and support (<b style="color:#6a1b9a;">Environmental Support</b>).
      </p>
      <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.6;margin:0 0 10px 0;">
        The resulting insights will help determine where interventions should be focused to maximize coaching adoption, effectiveness, and long-term sustainability.
      </p>

 <!-- Image --> 
       <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:20px;margin-bottom:12px;"> <tr> <td style="padding:0;"> <img src="${CompareImageBase64}" style="width:100%;max-height:230px;object-fit:contain;display:block;" /> </td> </tr> </table>


      </td></tr>
    </table>
  ${analysisSection}
</div>

<script>
// Composite quadrant chart
(function() {
  var canvas = document.getElementById('compositeChart');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var cx = 230, cy = 180, r = 140;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, Math.PI, Math.PI * 1.5); ctx.closePath();
  ctx.fillStyle = '#2e7d32'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, Math.PI * 1.5, 0); ctx.closePath();
  ctx.fillStyle = '#e65100'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, Math.PI * 0.5, Math.PI); ctx.closePath();
  ctx.fillStyle = '#1a237e'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, 0, Math.PI * 0.5); ctx.closePath();
  ctx.fillStyle = '#6a1b9a'; ctx.fill();
  ctx.strokeStyle = '#fffde7'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, cy - r - 5); ctx.lineTo(cx, cy + r + 5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - r - 5, cy); ctx.lineTo(cx + r + 5, cy); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('Skill', cx - 55, cy - 50); ctx.fillText('Composite', cx - 55, cy - 33);
  ctx.fillText('Will', cx + 55, cy - 50); ctx.fillText('Composite', cx + 55, cy - 33);
  ctx.font = 'bold 11px Arial';
  ctx.fillText('Directive vs.', cx - 55, cy + 30); ctx.fillText('Non-Directive', cx - 55, cy + 45); ctx.fillText('Scale', cx - 55, cy + 60);
  ctx.fillText('Environmental', cx + 55, cy + 25); ctx.fillText('Support', cx + 55, cy + 40); ctx.fillText('Composite', cx + 55, cy + 55);
  ctx.fillStyle = '#1A1A1A'; ctx.font = '11px Arial'; ctx.textAlign = 'right';
  ctx.fillText('Skill', cx - r + 25, cy - 80);
  ctx.fillText('Behavior', cx - r + 15, cy - 65);
  ctx.fillText('Knowledge', cx - r + 9, cy - 50);
  ctx.textAlign = 'left';
  ctx.fillText('Motivation', cx + r - 42, cy - 100);
  ctx.fillText('Confidence', cx + r - 30, cy - 85);
  ctx.fillText('Belief', cx + r - 18, cy - 70);
  ctx.fillText('Commitment', cx + r - 10, cy - 55);
  ctx.fillText('People', cx + r - 10, cy + 60);
  ctx.fillText('Leadership', cx + r - 16, cy + 75);
  ctx.fillText('Organization', cx + r - 28, cy + 90);
})();
</script>

</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Landscape Pre/Post Candidate Table (for page 2 of merged PDF)
// ─────────────────────────────────────────────────────────────────────────────

const ppFmt = (v: number | null): string => {
  if (v == null) return "—";
  return (v / 10).toFixed(1);
};
const ppFmtPct = (v: number | null): string => {
  if (v == null) return "—";
  return `${v.toFixed(1)}%`;
};
const ppFmtPct1 = (v: number | null): string => {
  if (v == null) return "—";
  return `${v.toFixed(1)}`;
};

function ldeltaCell(pre: number | null, post: number | null): string {
  if (pre == null || post == null) return "—";
  const d = ((Number(post) - Number(pre)) / Number(pre)) * 100;
  const rounded = Math.round(d);
  const color = rounded > 0 ? "#2e8b44" : rounded < 0 ? "#c62828" : "#888";
  const text = rounded > 0 ? `+${rounded}%` : `${rounded}%`;
  return `<span style="color:${color};font-weight:bold;">${text}</span>`;
}

export interface PrePostAverages {
  preSkills: string;
  postSkills: string;
  preWill: string;
  postWill: string;
  preEnv: string;
  postEnv: string;
  preTotal: string;
  postTotal: string;
  preSkillRating: string;
  postSkillRating: string;
  preDN: string;
  postDN: string;
}

export function generatePrePostLandscapeHTML(
  groupName: string,
  cohort: string,
  candidates: CandidateRow[],
  averages: PrePostAverages,
  logoBase64: string,
): string {
  const rows = candidates
    .map((c, i) => {
      return `
                 <tr style="border-bottom:1px solid #e0e0e0;">
            <td style="padding:2px 3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#2c2c2c;text-align:center;background-color:#f5c842;">${i + 1}</td>
            <td style="padding:2px 5px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#2c2c2c;background-color:#fffde7;">${c.name}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#4caf50;text-align:center;background-color:#e6e7e8;">${ppFmt(c.preSkills)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#4caf50;text-align:center;">${ppFmt(c.postSkills)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#ff9800;text-align:center;background-color:#e6e7e8;">${ppFmt(c.preWill)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#ff9800;text-align:center;">${ppFmt(c.postWill)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#9c27b0;text-align:center;background-color:#e6e7e8;">${ppFmt(c.preEnv)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#9c27b0;text-align:center;">${ppFmt(c.postEnv)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#f57f17;text-align:center;background-color:#e6e7e8">${ppFmtPct1(c.preSkillRating)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#f57f17;text-align:center;">${ppFmtPct1(c.postSkillRating)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#c62828;text-align:center;background-color:#e6e7e8;">${ppFmt(c.preDN)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#c62828;text-align:center;">${ppFmt(c.postDN)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#e6e7e8;">${ppFmtPct(c.preTotal)}</td>
            <td style="padding:2px 3px;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;">${ppFmtPct(c.postTotal)}</td>
          </tr>
               `;
    })
    .join("");

  const avgRow = `

           `;

  return `<!DOCTYPE html>
         <html>
         <head>
           <meta charset="UTF-8"/>
           <style>
             @page { size: 297mm 250mm; margin: 10px 10px 10px 10px; }
             body { font-family: Arial, sans-serif; padding: 10px; background-color: #fff; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
             .header { text-align: center; margin-bottom: 8px; }
             .header h1 { font-size: 16px; font-weight: bold; margin: 0; color: #1A1A1A; font-family: Arial, sans-serif; }
             .header p { font-size: 11px; color: #666; margin: 2px 0; font-family: Arial, sans-serif; }
             .logo { max-width: 140px; max-height: 60px; object-fit: contain; margin-bottom: 6px; }
             table { width: 100%; border-collapse: collapse; }
             th { background-color: #1A1A1A; color: #fff; font-size: 9px; font-family: Arial, sans-serif; padding: 5px 4px; border: 1px solid #333; text-align: center; }
             .col-name { text-align: left; }
             .group-header { background-color: #333; color: #fff; font-size: 8px; font-weight: bold; text-align: center; }
             .pre-header { background-color: #0D2E1A; color: #4ADE80; }
             .post-header { background-color: #1A1635; color: #818CF8; }
             .delta-header { background-color: #444; color: #fff; }
             .section-skill { border-top: 3px solid #4ADE80; }
             .section-will { border-top: 3px solid #818CF8; }
             .section-env { border-top: 3px solid #F5C842; }
             .section-total { border-top: 3px solid #FF6B6B; }
             .section-rating { border-top: 3px solid #00CED1; }
             .section-dn { border-top: 3px solid #FF8C00; }
           </style>
         </head>
         <body>
           <div class="header">
            <!-- ${logoBase64 && logoBase64.length > 100 ? `<img src="${logoBase64}" class="logo" />` : ""} -->
                          ${sectionTitle1("Candidate Pre vs Post Results", "#f5c842")}
             <!-- <p><strong>Group:</strong> ${groupName || "—"} &nbsp;|&nbsp; <strong>Cohort:</strong> ${cohort || "—"} &nbsp;|&nbsp; <strong>Candidates:</strong> ${candidates.length}</p> -->
           </div>
           <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:20px;margin-top:-5px;margin-bottom:2px;">

             <thead>
        <tr>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#2c2c2c;text-align:center;background-color:#f5c842;">#</td>
          <td style="padding:3px 5px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#2c2c2c;background-color:#fffde7;">${groupName || "Candidate"}</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#e8f5e9;">Skills Pre</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#e8f5e9;">Skills Post</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#fff3e0;">Will Pre</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#fff3e0;">Will Post</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#f3e5f5;">Env Pre</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#f3e5f5;">Env Post</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#fff8e1;">Skill Rating Pre</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#fff8e1;">Skill Rating Post</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#fce4ec;">D/N Pre</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#fce4ec;">D/N Post</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#e0f7fa;">Total Pre</td>
          <td style="padding:3px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;background-color:#e0f7fa;">Total Post</td>
        </tr>
      </thead>
             <tbody>
               ${rows}
               ${avgRow}
             </tbody>
           </table>
         </body>
         </html>`;
}
