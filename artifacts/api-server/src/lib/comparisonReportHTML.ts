import type { CandidateInfo, Composites, PerceivedActual } from "./reportHTML";

export interface ComparisonSubmission {
  label: string;
  submittedAt: string;
  candidateInfo: CandidateInfo;
  perceivedActual: PerceivedActual;
  composites: Composites;
  scores: Record<string, number>;
}

export interface ComparisonPhase {
  phaseType: string;
  submission: ComparisonSubmission;
}

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
  return d > 0 ? `+${d}` : `${d}`;
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
function invertedDeltaColor(
  pre: number | undefined | null,
  post: number | undefined | null,
): string {
  if (pre == null || post == null) return "#888888";
  const d =
    Number(pre) !== 0 ? ((Number(post) - Number(pre)) / Number(pre)) * 100 : 0;
  if (d > 0) return "#c62828"; // increase = red
  if (d < 0) return "#2e8b44"; // decrease = green
  return "#888888";
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
      <div
        style="
          width:48%;
          display:inline-block;
          text-align:center;
          vertical-align:top;
        "
      >
        <div
          style="
            font-size:20px;
            font-weight:bold;
            margin-bottom:4px;
            margin-top:-20px;
            color:${color};
            font-family:Arial,sans-serif;
          "
        >
          ${label} Pie Chart
        </div>       

      </div>
    `;
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
        <div
          style="
            display:flex;
            align-items:center;
            gap:6px;
            margin-bottom:3px;
            font-size:20px;
            font-family:Arial,sans-serif;
          "
        >
          <div
            style="
              width:10px;
              height:10px;
              background:${bg};
              border-radius:2px;
            "
          ></div>

          <span>
            Score ${score}
            (${spread}%)
          </span>
        </div>
      `;
    })
    .join("");

  return `
    <div
      style="
        width:48%;
        display:inline-block;
        text-align:center;
        vertical-align:top;
      "
    >
      <div
        style="
          font-size:20px;
          font-weight:bold;
          margin-bottom:10px;
          color:${color};
          font-family:Arial,sans-serif;
        "
      >
        ${label} CRA Pie Chart
      </div>

      <div
        style="
          width:160px;
          height:160px;
          border-radius:50%;
          margin:0 auto 12px auto;
          background:
            conic-gradient(
              ${segments}
            );
          border:4px solid #fff;
          box-shadow:0 0 0px rgba(0,0,0,0.15);
        "
      ></div>

      <div
        style="
          text-align:left;
          display:inline-block;
        "
      >
        ${legend}
      </div>
    </div>
  `;
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

export function generateComparisonReportHTML(
  phases: ComparisonPhase[],
  logoBase64: string = "",
  candidateName?: string,
  quoteImageBase64: string = "",
  cardImagesBase64: string[] = [],
  chartImageBase64: string = "",
  actualskillsImageBase64: string = "",
  CompositeImageBase64: string = "",
  CRAImageBase64: string = "",
  CompareImageBase64: string = "",
): string {
  if (phases.length < 2) throw new Error("At least 2 phases required");

  const [phaseA, phaseB] = phases;
  const a = phaseA.submission;
  const b = phaseB.submission;

  const aSkills = Number(a.composites.skills?.percent ?? 0);
  const aWill = Number(a.composites.will?.percent ?? 0);
  const aEnv = Number(a.composites.environmentalSupport?.percent ?? 0);
  const aDn = Number(a.composites.directiveNonDirective?.percent ?? 0);
  const aCRA =
    Math.round(((aSkills * 1.3 + aWill * 1.45 + aEnv * 1.25) / 4) * 10) / 10;

  const bSkills = Number(b.composites.skills?.percent ?? 0);
  const bWill = Number(b.composites.will?.percent ?? 0);
  const bEnv = Number(b.composites.environmentalSupport?.percent ?? 0);
  const bDn = Number(b.composites.directiveNonDirective?.percent ?? 0);
  const bCRA =
    Math.round(((bSkills * 1.3 + bWill * 1.45 + bEnv * 1.25) / 4) * 10) / 10;

  const aLabel = phaseA.phaseType.toUpperCase();
  const bLabel = phaseB.phaseType.toUpperCase();

  const aColor =
    phaseA.phaseType.toLowerCase() === "pre" ? "#2e8b44" : "#3730a3";
  const bColor =
    phaseB.phaseType.toLowerCase() === "post" ? "#3730a3" : "#c65b22";

  const displayName =
    candidateName || a.candidateInfo.name || b.candidateInfo.name || "—";

  const formatDate = (s: string) => {
    if (!s) return "—";
    const d = new Date(s);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const logoBlock =
    logoBase64 && logoBase64.length > 100
      ? `<img 
          src="${logoBase64}" 
          style="
            max-width:900px;
            max-height:950px;
            object-fit:contain;
            display:block;
            margin:0px auto 20 auto;
          " 
        />`
      : `<p style="
          color:#f5c842;
          font-size:22px;
          font-weight:bold;
          font-family:Arial,sans-serif;
          margin:-40px 0 0 0;
          letter-spacing:2px;
          text-align:center;
        ">
          avidity<span style="color:#ffffff;">®</span> international
        </p>`;

  const header = `
    <div style="
      padding:0;
      margin:0;
      text-align:center;
      border-radius:8px;
      margin-bottom:20px;
    ">
      <div style="
        display:flex;
        justify-content:center;
        align-items:center;
        margin-top:0;
        padding-top:0;
      ">
        ${logoBlock}
      </div>
      </div>


  `;

  const comparisonBanner = `<p style="color:#ffeb00;font-size:20px;font-weight:bold;font-family:Arial,sans-serif;margin:0 0 14px 0;letter-spacing:1px;text-align:center;">COACH READINESS ASSESSMENT — ${aLabel} vs ${bLabel} COMPARISON</p>`;

  const infoTable = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:2px solid #f5c842;border-radius:15px;background-color:#fffde7;margin-bottom:12px;">
      
      <tr>
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;"><b>Name</b></td>
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;text-align:center;">${b.candidateInfo.name || displayName}</td>
      </tr>
      <tr style="background-color:#fff9e6;">
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;"><b>Submission Date</b></td>
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;text-align:center;">${formatDate(b.submittedAt)}</td>
      </tr>
      <tr>
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;"><b>Gender</b></td>
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;text-align:center;">${b.candidateInfo.gender || "—"}</td>
      </tr>
      <tr style="background-color:#fff9e6;">
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;"><b>Age</b></td>
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;text-align:center;">${b.candidateInfo.age || "—"}</td>
      </tr>
      <tr>
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;"><b>Years in Organization</b></td>
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;text-align:center;">${b.candidateInfo.yearsInOrganization || "—"}</td>
      </tr>
      <tr style="background-color:#fff9e6;">
        <td style="font-size:20px;font-weight:bold;font-family:Arial,sans-serif;padding:8px 10px;color:#333;border-radius:0 0 0 15px;"><b>Years in Position</b></td>
        <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:5px 10px;text-align:center;border-radius:0 0 15px 0;">${b.candidateInfo.yearsInPosition || "—"}</td>
      </tr>
    </table>`;

  const makeBarsSection = (
    title: string,
    titleColor: string,
    rows: Array<{
      label: string;
      aVal: number | undefined;
      bVal: number | undefined;
      color: string;
    }>,
  ) => `
    ${sectionTitle(title, titleColor)}

    <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      border-collapse:collapse;
      border:2px solid #f5c842;
      border-radius:15px;
      background-color:#fffde7;
      margin-bottom:20px;
      overflow:hidden;
    "
  >
      <tr>
        <td style="width:30%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;padding-bottom:4px;"></td>
        <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${aColor};padding-bottom:4px;padding-left:4px;">${aLabel}</td>
        <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${bColor};padding-bottom:4px;padding-left:4px;">${bLabel}</td>
        <td style="width:14%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;text-align:center;padding-bottom:4px;"></td>
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
            d != null ? (d > 0 ? `▲ +${d}%` : d < 0 ? `▼ ${d}%` : "→ 0") : "—";

          return `
          <tr>
            <td
              style="
                font-size:20px;
                font-family:Arial,sans-serif;
                color:#333;
                padding:3px 8px 3px 0;
                vertical-align:middle;
                font-weight:bold;
              "
            >
              ${r.label}
            </td>

            <td
              style="
                vertical-align:middle;
                padding:3px 4px;
              "
            >
              ${bar(
                Number(r.aVal ?? 0) <= 10
                  ? Number(r.aVal ?? 0) * 10
                  : Number(r.aVal ?? 0),
                r.color,
              )}
            </td>

            <td
              style="
                vertical-align:middle;
                padding:3px 4px;
              "
            >
              ${bar(
                Number(r.bVal ?? 0) <= 10
                  ? Number(r.bVal ?? 0) * 10
                  : Number(r.bVal ?? 0),
                r.color,
              )}
            </td>

            <td
              style="
                font-size:20px;
                font-family:Arial,sans-serif;
                text-align:center;
                font-weight:bold;
                color:${dc};
                padding:3px 4px;
              "
            >
              ${ds}
            </td>
          </tr>
        `;
        })
        .join("")}
    </table>
  `;

  const CRA = `
    <div style="border:2px solid #f5c842;border-radius:15px;background-color:#fffde7;margin-bottom:12px;overflow:hidden;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">

        <tr>
          <td style="width:34%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;padding:6px 8px;"></td>
          <td style="width:27%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${aColor};padding:6px 8px;">${aLabel}</td>
          <td style="width:27%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${bColor};padding:6px 8px;">${bLabel}</td>
          <td style="width:12%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;text-align:center;padding:6px 8px;">Change</td>
        </tr>
        ${[
          {
            label: "Total CRA Score",
            aVal: aCRA,
            bVal: bCRA,
            color: "#666",
            invert: false,
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
                ? r.invert
                  ? d > 0
                    ? "#c62828"
                    : d < 0
                      ? "#2e8b44"
                      : "#888"
                  : d > 0
                    ? "#2e8b44"
                    : d < 0
                      ? "#c62828"
                      : "#888"
                : "#888";
            const ds =
              d != null ? (d > 0 ? `▲ +${d}` : d < 0 ? `▼ ${d}` : "→ 0") : "—";
            return `
            <tr>
              <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:6px 8px;vertical-align:middle;font-weight:bold;">${r.label}</td>
              <td style="vertical-align:middle;padding:6px 8px;">
                ${bar(Number(r.aVal ?? 0) <= 10 ? Number(r.aVal ?? 0) * 10 : Number(r.aVal ?? 0), r.color)}
              </td>
              <td style="vertical-align:middle;padding:6px 8px;">
                ${bar(Number(r.bVal ?? 0) <= 10 ? Number(r.bVal ?? 0) * 10 : Number(r.bVal ?? 0), r.color)}
              </td>
              <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;font-weight:bold;color:${dc};padding:6px 8px;">${ds}</td>
            </tr>`;
          })
          .join("")}
        
      </table>
    </div>
  `;

  const summaryTable = `
    <div style="border:2px solid #f5c842;border-radius:15px;background-color:#fffde7;margin-bottom:12px;overflow:hidden;">
    <!-- Image -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;margin-top:-1px;margin-bottom:5px;">
        <tr>
          <td style="padding:0;">
            <img src="${CompositeImageBase64}"
                 style="width:100%;max-height:180px;object-fit:contain;display:block;" />
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">

        <tr>
          <td style="width:34%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;padding:6px 8px;"></td>
          <td style="width:27%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${aColor};padding:6px 8px;">${aLabel}</td>
          <td style="width:27%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${bColor};padding:6px 8px;">${bLabel}</td>
          <td style="width:12%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;text-align:center;padding:6px 8px;">Change</td>
        </tr>
        ${[
          {
            label: "Total CRA Score",
            aVal: aCRA,
            bVal: bCRA,
            color: "#666",
            invert: false,
          },
          {
            label: "Skills",
            aVal: aSkills,
            bVal: bSkills,
            color: "#4caf50",
            invert: false,
          },
          {
            label: "Will",
            aVal: aWill,
            bVal: bWill,
            color: "#ff9800",
            invert: false,
          },
          {
            label: "Environmental Support",
            aVal: aEnv,
            bVal: bEnv,
            color: "#9c27b0",
            invert: false,
          },
          {
            label: "Directive / Non-Directive",
            aVal: aDn,
            bVal: bDn,
            color: "#1565c0",
            invert: true,
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
                ? r.invert
                  ? d > 0
                    ? "#c62828"
                    : d < 0
                      ? "#2e8b44"
                      : "#888"
                  : d > 0
                    ? "#2e8b44"
                    : d < 0
                      ? "#c62828"
                      : "#888"
                : "#888";
            const ds =
              d != null ? (d > 0 ? `▲ +${d}` : d < 0 ? `▼ ${d}` : "→ 0") : "—";
            return `
            <tr>
              <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:6px 8px;vertical-align:middle;font-weight:bold;">${r.label}</td>
              <td style="vertical-align:middle;padding:6px 8px;">
                ${bar(Number(r.aVal ?? 0) <= 10 ? Number(r.aVal ?? 0) * 10 : Number(r.aVal ?? 0), r.color)}
              </td>
              <td style="vertical-align:middle;padding:6px 8px;">
                ${bar(Number(r.bVal ?? 0) <= 10 ? Number(r.bVal ?? 0) * 10 : Number(r.bVal ?? 0), r.color)}
              </td>
              <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;font-weight:bold;color:${dc};padding:6px 8px;">${ds}</td>
            </tr>`;
          })
          .join("")}
        <!-- Description row at the bottom -->
        <tr>
          <td colspan="4" style="padding:10px 14px;">
            <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;">
              This section presents a direct comparison of your <b>${aLabel}</b> assessment scores against your <b>${bLabel}</b> assessment result across each composite —
              <b style="color:#2e7d32;">Skills</b>,
              <b style="color:#e65100;">Will</b>, and
              <b style="color:#6a1b9a;">Environmental Support</b>.
              This allows us to see how you stand before and after interventions, highlighting strengths or areas for improvement in the broader context of your journey.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;

  const scorePieCharts = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:2px solid #f5c842;border-radius:15px;background-color:#fffde7;margin-bottom:18px;">
      <tr><td style="padding:10px 14px;">

 <!-- Image -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;margin-top:-11px;margin-bottom:5px;">
        <tr>
          <td style="padding:0;">
            <img src="${CRAImageBase64}"
                 style="width:100%;max-height:180px;object-fit:contain;display:block;" />
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffeb00;border-radius:10px;margin-bottom:0px;margin-top:0px;">
        <tr><td style="padding:8px 12px;background-color:#f5c842;border-radius:10px;">
          <p style="font-size:20px;font-family:Arial,sans-serif;color:#000;margin:0;line-height:1.4;">This chart illustrates the percentage of scores chosen by candidates on a scale of 1 to 10 from all <b>133</b> statement responses in the Coach Readiness Assessment. Each slice represents how often a particular score was selected.</p>
        </td></tr>
      </table>

      </tr>
      <tr>
        <td colspan="2" style="padding:0px;">
          <div style="width:100%;display:flex;justify-content:space-between;gap:12px;margin-top;-15px;">
            ${makePieChart(a.scores || {}, aLabel, aColor)}
            ${makePieChart(b.scores || {}, bLabel, bColor)}
          </div>
        </td>
      </tr>
    </table>
  `;

  const SkillbarsPage = `
    ${makeBarsSection("Skills ", "#4caf50", [
      {
        label: "Knowledge",
        aVal: (a.composites.skills as any)?.knowledge,
        bVal: (b.composites.skills as any)?.knowledge,
        color: "#4caf50",
      },
      {
        label: "Behavior",
        aVal: (a.composites.skills as any)?.behavior,
        bVal: (b.composites.skills as any)?.behavior,
        color: "#66bb6a",
      },
      {
        label: "Skill",
        aVal: (a.composites.skills as any)?.skill,
        bVal: (b.composites.skills as any)?.skill,
        color: "#81c784",
      },
    ])}`;
  const WillbarsPage = `
    ${makeBarsSection("Will ", "#ff9800", [
      {
        label: "Motivation",
        aVal: (a.composites.will as any)?.motivation,
        bVal: (b.composites.will as any)?.motivation,
        color: "#ff9800",
      },
      {
        label: "Belief",
        aVal: (a.composites.will as any)?.belief,
        bVal: (b.composites.will as any)?.belief,
        color: "#ffa726",
      },
      {
        label: "Confidence",
        aVal: (a.composites.will as any)?.confidence,
        bVal: (b.composites.will as any)?.confidence,
        color: "#ffb74d",
      },
      {
        label: "Commitment",
        aVal: (a.composites.will as any)?.commitment,
        bVal: (b.composites.will as any)?.commitment,
        color: "#ffcc02",
      },
    ])}`;
  const EnvbarsPage = `
    ${makeBarsSection("Environmental Support ", "#9c27b0", [
      {
        label: "Leadership",
        aVal: (a.composites.environmentalSupport as any)?.leadership,
        bVal: (b.composites.environmentalSupport as any)?.leadership,
        color: "#9c27b0",
      },
      {
        label: "Organization",
        aVal: (a.composites.environmentalSupport as any)?.organization,
        bVal: (b.composites.environmentalSupport as any)?.organization,
        color: "#ab47bc",
      },
      {
        label: "People",
        aVal: (a.composites.environmentalSupport as any)?.people,
        bVal: (b.composites.environmentalSupport as any)?.people,
        color: "#ba68c8",
      },
    ])}`;

  const dnAVal = a.composites.directiveNonDirective?.percent;
  const dnBVal = b.composites.directiveNonDirective?.percent;
  const dnD =
    dnAVal != null && dnBVal != null && Number(dnAVal) !== 0
      ? Math.round(((Number(dnBVal) - Number(dnAVal)) / Number(dnAVal)) * 100)
      : null;
  const dnDc =
    dnD != null ? (dnD > 0 ? "#c62828" : dnD < 0 ? "#2e8b44" : "#888") : "#888";
  const dnDs =
    dnD != null ? (dnD > 0 ? `▲ +${dnD}` : dnD < 0 ? `▼ ${dnD}` : "→ 0") : "—";

  const directiveBarsPage = `
    ${sectionTitle("Directive / Non-Directive", "#1565c0")}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr">
          <td style="width:30%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;padding:8px 8px;"></td>
          <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${aColor};padding:8px 8px;">${aLabel}</td>
          <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${bColor};padding:8px 8px;">${bLabel}</td>
          <td style="width:14%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;padding:8px 8px;"></td>
        </tr>
        <tr>
          <td style="width:33%; font-size:20px;font-family:Arial,sans-serif;color:#333;padding:6px 8px;vertical-align:middle;font-weight:bold;">Directive / Non-Directive</td>
          <td style="vertical-align:middle;padding:6px 8px;">
            ${bar(Number(dnAVal ?? 0) <= 10 ? Number(dnAVal ?? 0) * 10 : Number(dnAVal ?? 0), "#1565c0")}
          </td>
          <td style="vertical-align:middle;padding:6px 8px;">
            ${bar(Number(dnBVal ?? 0) <= 10 ? Number(dnBVal ?? 0) * 10 : Number(dnBVal ?? 0), "#1565c0")}
          </td>
          <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;font-weight:bold;color:${dnDc};padding:6px 8px;">${dnDs}</td>
        </tr>
      </table>

  `;

  // Pre-compute outside the template string
  const wttAVal = a.perceivedActual?.whatTheyThinkPercent;
  const wttBVal = b.perceivedActual?.whatTheyThinkPercent;
  const wttD =
    wttAVal != null && wttBVal != null && Number(wttAVal) !== 0
      ? Math.round(
          ((Number(wttBVal) - Number(wttAVal)) / Number(wttAVal)) * 100,
        )
      : null;
  const wttDc =
    wttD != null
      ? wttD > 0
        ? "#2e8b44"
        : wttD < 0
          ? "#c62828"
          : "#888"
      : "#888";
  const wttDs =
    wttD != null
      ? wttD > 0
        ? `▲ +${wttD}`
        : wttD < 0
          ? `▼ ${wttD}`
          : "→ 0"
      : "—";

  const wtaAVal = a.perceivedActual?.whereTheyArePercent;
  const wtaBVal = b.perceivedActual?.whereTheyArePercent;
  const wtaD =
    wtaAVal != null && wtaBVal != null && Number(wtaAVal) !== 0
      ? Math.round(
          ((Number(wtaBVal) - Number(wtaAVal)) / Number(wtaAVal)) * 100,
        )
      : null;
  const wtaDc =
    wtaD != null
      ? wtaD > 0
        ? "#2e8b44"
        : wtaD < 0
          ? "#c62828"
          : "#888"
      : "#888";
  const wtaDs =
    wtaD != null
      ? wtaD > 0
        ? `▲ +${wtaD}`
        : wtaD < 0
          ? `▼ ${wtaD}`
          : "→ 0"
      : "—";

  const perceivedActualBars = `
    <div style="border:2px solid #f5c842;border-radius:15px;background-color:#fffde7;margin-bottom:12px;overflow:hidden;">
    <!-- Image -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;margin-top:-1px;margin-bottom:5px;">
        <tr>
          <td style="padding:0;">
            <img src="${actualskillsImageBase64}"
                 style="width:100%;max-height:180px;object-fit:contain;display:block;" />
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">

        <tr>
          <td style="width:30%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;padding:6px 8px;"></td>
          <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${aColor};padding:6px 8px;">${aLabel}</td>
          <td style="width:28%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:${bColor};padding:6px 8px;">${bLabel}</td>
          <td style="width:14%;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#555;text-align:center;padding:6px 8px;">Change</td>
        </tr>
        <tr>
          <td style="font-size:25px;font-family:Arial,sans-serif;color:#333;padding:6px 8px;vertical-align:middle;font-weight:bold;">What They Think</td>
          <td style="vertical-align:middle;padding:6px 8px;">${bar(Number(wttAVal ?? 0) <= 10 ? Number(wttAVal ?? 0) * 10 : Number(wttAVal ?? 0), "#607d8b")}</td>
          <td style="vertical-align:middle;padding:6px 8px;">${bar(Number(wttBVal ?? 0) <= 10 ? Number(wttBVal ?? 0) * 10 : Number(wttBVal ?? 0), "#607d8b")}</td>
          <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;font-weight:bold;color:${wttDc};padding:6px 8px;">${wttDs}</td>
        </tr>
        <tr>
          <td style="font-size:25px;font-family:Arial,sans-serif;color:#333;padding:6px 8px;vertical-align:middle;font-weight:bold;">Where They Are</td>
          <td style="vertical-align:middle;padding:6px 8px;">${bar(Number(wtaAVal ?? 0) <= 10 ? Number(wtaAVal ?? 0) * 10 : Number(wtaAVal ?? 0), "#90a4ae")}</td>
          <td style="vertical-align:middle;padding:6px 8px;">${bar(Number(wtaBVal ?? 0) <= 10 ? Number(wtaBVal ?? 0) * 10 : Number(wtaBVal ?? 0), "#90a4ae")}</td>
          <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;font-weight:bold;color:${wtaDc};padding:6px 8px;">${wtaDs}</td>
        </tr>
        <tr>
          <td colspan="4" style="padding:10px 14px;">
            <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.4;margin:0 0 6px 0;">
              The charts above contrast your self-assessed coaching skills with your objectively measured skills.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:4px;">
              <tr>
                <td style="width:10px;vertical-align:top;padding-top:1px;"><span style="color:#f5c842;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">•</span></td>
                <td style="padding-left:6px;"><p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.2;margin:0;"><b style="color:#66bb6a;">What They Think:</b> represents how you think you are in your abilities to coach</p></td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:4px;">
              <tr>
                <td style="width:10px;vertical-align:top;padding-top:1px;"><span style="color:#f5c842;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">•</span></td>
                <td style="padding-left:6px;"><p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.2;margin:0;"><b style="color:#1b5e20;">Where They Are:</b> represents your actual coaching practice based on the assessment</p></td>
              </tr>
            </table>
            <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.4;margin:0;font-style:italic;">
              The gap between these two scores highlights the areas for growth to help you gain more accurate awareness and insight about yourself, guiding targeted development.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;

  const makeImprovRow = (
    label: string,
    aVal: number | undefined | null,
    bVal: number | undefined | null,
    color: string,
  ) => {
    const d =
      aVal != null && bVal != null && Number(aVal) !== 0
        ? Math.round(((Number(bVal) - Number(aVal)) / Number(aVal)) * 100)
        : null;
    const dc =
      d != null ? (d > 0 ? "#2e8b44" : d < 0 ? "#c62828" : "#888") : "#888";
    const ds = d != null ? (d > 0 ? `▲ +${d}` : d < 0 ? `▼ ${d}` : "→ 0") : "—";
    return `<tr style="border-bottom:1px solid #eee;">
      <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;padding:6px 8px;font-weight:bold;">${label}</td>
      <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;padding:6px 8px;">
        <span style="background-color:${aColor};color:#fff;border-radius:10px;padding:2px 10px;font-weight:bold;font-size:20px;">${pct(aVal)}</span>
      </td>
      <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;padding:6px 8px;">
        <span style="background-color:${bColor};color:#fff;border-radius:10px;padding:2px 10px;font-weight:bold;font-size:20px;">${pct(bVal)}</span>
      </td>
      <td style="font-size:20px;font-family:Arial,sans-serif;text-align:center;font-weight:bold;color:${dc};padding:6px 8px;">${ds}</td>
    </tr>`;
  };

  const improvTableHeader = `<tr style="background-color:#f5c842;">
    <td style="font-size:20px;font-weight:bold;font-family:Arial,sans-serif;padding:8px;color:#333;">Composite / Sub-dimension</td>
    <td style="font-size:20px;font-weight:bold;font-family:Arial,sans-serif;padding:8px;text-align:center;color:${aColor};">${aLabel}</td>
    <td style="font-size:20px;font-weight:bold;font-family:Arial,sans-serif;padding:8px;text-align:center;color:${bColor};">${bLabel}</td>
    <td style="font-size:20px;font-weight:bold;font-family:Arial,sans-serif;padding:8px;text-align:center;color:#333;">Change</td>
  </tr>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    @page { size: 210mm 520mm; margin: 15px 15px 40px 15px; }
    body { font-family: Arial, sans-serif; padding: 14px; background-color: #fffde7; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-break { page-break-after: always; padding-bottom: 20px;}
  </style>
</head>
<body>

<div class="page-break">

  ${header}
  <!-- ${comparisonBanner} -->

   <!-- Description paragraphs -->
  <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.2;margin:0 ;text-align:justify;">
    The Coach Readiness Assessment (CRA) evaluates participants against a set of clearly defined criteria, including skills, motivation, and beliefs, to identify individuals with the attributes needed for successful coaching implementation.
  </p>
  <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.2;margin:0 0 16px 0;text-align:justify;">
    This comprehensive approach helps identify potential roadblocks early, enabling proactive interventions and smoother program implementation.
  </p>

  <!-- Quote block -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:-10px;margin-bottom:16px;">
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
            <img src="${cardImagesBase64[0]}" style="width:100%;max-height:200px;object-fit:contain;display:block;" />
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

<!-- PAGE 2: Candidate Info + Composite Summary -->
<div class="page-break">
  <!-- ${header} -->

  <!-- <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;font-weight:bold;margin:0 0 10px 0;">Candidate: ${displayName}</p> -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f5c842;border-radius:25px;margin-top:10px;margin-bottom:10px;">
    <tr>
      <td style="padding:10px;text-align:center;background-color:#000000;border-radius:25px;">
        <span style="font-weight:bold;font-size:30px;font-family:Arial,sans-serif;color:#ffeb00;">Candidate's Overall Summary</span>
      </td>
    </tr>
  </table>
  ${infoTable}

${CRA}

  ${perceivedActualBars}

  ${summaryTable}


  ${scorePieCharts}
</div>
<!-- PAGE 3: Side-by-side bar charts -->
<div class="page-break">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#fffde7;border-left:4px solid #fffde7;border-radius:4px;margin-bottom:0px; margin-top:0px ;">
  <!-- ${header} -->
  <!-- <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;font-weight:bold;margin:0 0 10px 0;">Candidate: ${displayName}</p> -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f5c842;border-radius:25px;margin-top:10px;margin-bottom:40px;">
    <tr>
      <td style="padding:10px;text-align:center;background-color:#000000;border-radius:25px;">
        <span style="font-weight:bold;font-size:30px;font-family:Arial,sans-serif;color:#ffeb00;">Detailed Composite Scores</span>
      </td>
    </tr>
  </table>
  ${SkillbarsPage}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:40px;">
    <tr><td style="padding:2px 4px;">
      <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;font-style:italic;">
        This section measures your core coaching competencies. It evaluates specific skills such as knowledge, practical coaching behaviors, and overall coaching skill. By assessing these, we can identify those with a strong foundation in coaching.
      </p>
    </td></tr>
  </table>
  ${WillbarsPage}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:40px;">
    <tr><td style="padding:2px 4px;">
      <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;font-style:italic;">
        This section assesses your mental preparedness to coach. It includes your motivation, confidence, commitment, and personal belief in your coaching potential. The higher the Will score, the more driven you are toward becoming a coaching leader.
      </p>
    </td></tr>
  </table>
  ${EnvbarsPage}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:40px;">
    <tr><td style="padding:2px 4px;">
      <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;font-style:italic;">
        This section evaluates the external factors that influence your coaching success. It measures the perceived support provided by your people, leadership, and organizational environment. Strong environmental support fosters sustained coaching practices.
      </p>
    </td></tr>
  </table>
  ${directiveBarsPage}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:40px;">
    <tr><td style="padding:2px 4px;">
      <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0 0 4px 0;font-style:italic;">
        This scale distinguishes between:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:1px;">
        <tr>
          <td style="width:10px;vertical-align:top;padding-top:1px;">
            <span style="color:#e65100;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">•</span>
          </td>
          <td style="padding-left:6px;">
            <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;">
              <b style="color:#e65100;">Directive Approach:</b> you still offer explicit answers and direction to your people
            </p>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:1px;">
        <tr>
          <td style="width:10px;vertical-align:top;padding-top:1px;">
            <span style="color:#2e7d32;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">•</span>
          </td>
          <td style="padding-left:6px;">
            <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;">
              <b style="color:#2e7d32;">Non-Directive Approach:</b> you facilitate your people to discover solutions by themselves
            </p>
          </td>
        </tr>
      </table>
      <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;font-style:italic;">
        By measuring where you fall on this scale, we identify whether you lean toward directing or empowering others in your leadership approach.
      </p>
    </td></tr>
  </table>

</table>
</div>


<!-- ═══════════════ PAGE 4 — REPORT PAGE 3 ═══════════════ -->
<div class="page-break">
  <!-- ${header} -->

 <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f5c842;border-radius:25px;margin-top:10px;margin-bottom:10px;">
    <tr>
      <td style="padding:10px;text-align:center;background-color:#000000;border-radius:25px;">
        <span style="font-weight:bold;font-size:30px;font-family:Arial,sans-serif;color:#ffeb00;">What do your results mean?</span>
      </td>
    </tr>
  </table>
  <!-- Intro statement for page 4 -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:2px solid #f5c842;border-radius:15px;background-color:#fffde7;margin-bottom:18px;">
      <tr><td style="padding:10px 14px;">

        <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.6;margin:0 0 8px 0;">
          Coaching success depends on more than skills alone. This section evaluates the balance and interaction between coaching capability (<b style="color:#2e7d32;">Skills</b>), coaching motivation (<b style="color:#e65100;">Will</b>), and support (<b style="color:#6a1b9a;">Environmental Support</b>).
        </p>

        <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.6;margin:0 0 10px 0;">
          The resulting insights will help you determine where interventions should be focused to maximize coaching adoption, effectiveness, and long-term sustainability.
        </p>

          <!-- Image --> 
       <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:20px;margin-bottom:12px;"> <tr> <td style="padding:0;"> <img src="${CompareImageBase64}" style="width:100%;max-height:230px;object-fit:contain;display:block;" /> </td> </tr> </table>


      </td></tr>
    </table>

      </td></tr>
    </table>

  ${[
    {
      leftLabel: "Skills",
      leftColor: "#2e7d32",
      leftPct: bSkills,

      rightLabel: "Will",
      rightColor: "#e65100",
      rightPct: bWill,

      ...getSkillsVsWill(bSkills, bWill),
    },

    {
      leftLabel: "Will",
      leftColor: "#e65100",
      leftPct: bWill,

      rightLabel: "Environmental Support",

      rightColor: "#6a1b9a",

      rightPct: bEnv,

      ...getWillVsEnv(bWill, bEnv),
    },

    {
      leftLabel: "Environmental Support",

      leftColor: "#6a1b9a",

      leftPct: bEnv,

      rightLabel: "Skills",

      rightColor: "#2e7d32",

      rightPct: bSkills,

      ...getEnvVsSkills(bEnv, bSkills),
    },
  ]
    .map(
      (c) => `
      <div style="margin-bottom:20px;">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            border-collapse:collapse;
            margin-bottom:10px;
          "
        >
          <tr>

            <td
              width="45%"
              style="
                background-color:${c.leftColor};
                border-radius:25px;
                padding:10px 14px;
              "
            >
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td
                    style="
                      color:#fff;
                      font-weight:bold;
                      font-size:25px;
                      font-family:Arial,sans-serif;
                    "
                  >
                    ${c.leftLabel}
                  </td>

                  <td
                    style="
                      color:#fff;
                      font-weight:bold;
                      font-size:25px;
                      font-family:Arial,sans-serif;
                      text-align:right;
                    "
                  >
                    ${Math.round(Number(c.leftPct || 0))}%
                  </td>
                </tr>
              </table>
            </td>

            <td
              width="10%"
              style="
                text-align:center;
                vertical-align:middle;
              "
            >
              <div
                style="
                  width:36px;
                  height:36px;
                  background-color:#f5c842;
                  border-radius:50%;
                  display:inline-flex;
                  align-items:center;
                  justify-content:center;
                  font-weight:bold;
                  font-size:25px;
                  font-family:Arial,sans-serif;
                  line-height:36px;
                  text-align:center;
                "
              >
                ${c.symbol}
              </div>
            </td>

            <td
              width="45%"
              style="
                background-color:${c.rightColor};
                border-radius:25px;
                padding:10px 14px;
              "
            >
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td
                    style="
                      color:#fff;
                      font-weight:bold;
                      font-size:25px;
                      font-family:Arial,sans-serif;
                    "
                  >
                    ${c.rightLabel}
                  </td>

                  <td
                    style="
                      color:#fff;
                      font-weight:bold;
                      font-size:25px;
                      font-family:Arial,sans-serif;
                      text-align:right;
                    "
                  >
                    ${Math.round(Number(c.rightPct || 0))}%
                  </td>
                </tr>
              </table>
            </td>

          </tr>
        </table>

        <div
          style="
            background:white;
            border-radius:12px;
            padding:14px;
            box-shadow:0 0px 0px rgba(0,0,0,0.1);
          "
        >
          <p
  style="
    font-weight:bold;
    text-align:center;
    font-size:25px;
    font-family:Arial,sans-serif;
    margin:0 0 8px 0;
    background-color:#ffed00;
    padding:6px 10px;
    border-radius:15px;
  "
>
  ${c.title}
</p>

          <p
            style="
              font-size:20px;
              text-align:center;
              color:#333;
              line-height:1.6;
              font-family:Arial,sans-serif;
              margin:0;
            "
          >
            ${c.statement}
          </p>
        </div>

      </div>
    `,
    )
    .join("")}

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
