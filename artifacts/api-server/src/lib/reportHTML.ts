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

// ── NEW: Group averages interface ──────────────────────────
export interface GroupAverages {
  groupSkills: number | null;
  groupWill: number | null;
  groupEnvironmentalSupport: number | null;
  total: number;
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

function makeBar(
  percent: number,
  fillColor: string,
  labelText: string,
): string {
  const pct = Math.min(Math.max(Math.round(Number(percent) || 0), 1), 99);
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:3px 0;"><tr><td width="${pct}%" style="width:${pct}%;background-color:${fillColor};height:35px;vertical-align:middle;padding-left:8px;border-top-left-radius:6px;border-bottom-left-radius:6px;"><span style="color:#ffffff;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">${labelText}</span></td><td width="${100 - pct}%" style="width:${100 - pct}%;background-color:#e0e0e0;height:35px;border-top-right-radius:6px;border-bottom-right-radius:6px;"></td></tr></table>`;
}

function pctTickRow(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:3px;"><tr><td style="font-size:20px;color:#777;font-family:Arial,sans-serif;text-align:left;">0%</td><td style="font-size:20px;color:#777;font-family:Arial,sans-serif;text-align:right;">100%</td></tr></table>`;
}

const TICK_ROW = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:2px;"><tr><td style="width:80px;"></td><td><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => `<td style="width:${100 / 11}%;font-size:20px;color:#777777;text-align:center;font-family:Arial,sans-serif;">${t}</td>`).join("")}</tr></table></td></tr></table>`;

function makeSubBar(
  rawValue: number,
  fillColor: string,
  labelText: string,
): string {
  const value = Number(rawValue) || 0;
  const pct = Math.round((Math.min(Math.max(value, 0), 10) / 10) * 100);
  const emptyPct = 100 - pct;
  return `<tr><td style="width:80px;font-size:20px;font-weight:bold;font-family:Arial,sans-serif;color:#333333;vertical-align:middle;padding:3px 8px 3px 0;">${labelText}</td><td style="vertical-align:middle;padding:6px 0;width:100%;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td width="${pct}%" style="width:${pct}%;background-color:${fillColor};height:35px;vertical-align:middle;padding-left:5px;border-top-left-radius:6px;border-bottom-left-radius:6px;"><span style="font-size:20px;font-weight:bold;font-family:Arial,sans-serif;color:#ffffff;">${value.toFixed(2)}</span></td><td width="${emptyPct}%" style="width:${emptyPct}%;background-color:#f0f0f0;height:35px;border-top-right-radius:6px;border-bottom-right-radius:6px;"></td></tr></table></td></tr>`;
}

function makePill(
  bgColor: string,
  leftText: string,
  rightText: string,
  totalPx: number,
): string {
  return `<table width="${totalPx}" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bgColor};border-radius:14px;height:35px;"><tr><td style="background-color:${bgColor};border-radius:14px;padding:0 12px;height:35px;vertical-align:middle;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="color:#ffffff;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;vertical-align:middle;">${leftText}</td><td style="color:#ffffff;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;text-align:right;vertical-align:middle;">${rightText}</td></tr></table></td></tr></table>`;
}

// ── Helper: a centred value pill ──────────────────────────
function makeValuePill(bgColor: string, text: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bgColor};border-radius:20px;margin:0 auto;"><tr><td style="padding:7px 16px;color:#fff;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">${text}</td></tr></table>`;
}

function makeSectionHeader(
  bgColor: string,
  leftText: string,
  rightText: string,
): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bgColor};border-radius:10px;margin-bottom:10px;margin-top:20px;"><tr><td style="background-color:${bgColor};border-radius:10px;padding:12px 16px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="color:#ffffff;font-weight:bold;font-size:25px;font-family:Arial,sans-serif;">${leftText}</td><td style="color:#ffffff;font-weight:bold;font-size:25px;font-family:Arial,sans-serif;text-align:right;">${rightText}</td></tr></table></td></tr></table>`;
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
// MAIN FUNCTION
// Pass groupAverages for group reports, null/undefined for individual reports
// ─────────────────────────────────────────────────────────────────────────────
export function generateReportHTML(
  candidateInfo: CandidateInfo,
  perceivedActual: PerceivedActual,
  composites: Composites,
  scores: Record<string, number>,
  logoBase64: string = "",
  groupAverages?: GroupAverages | null,
  quoteImageBase64: string = "",
  cardImagesBase64: string[] = [],
  chartImageBase64: string = "",
  actualskillsImageBase64: string = "",
  CompositeImageBase64: string = "",
  CRAImageBase64: string = "",
  CompareImageBase64: string = "",
): string {
  const skillsPct = Number(composites.skills?.percent ?? 0);
  const willPct = Number(composites.will?.percent ?? 0);
  const envPct = Number(composites.environmentalSupport?.percent ?? 0);
  const dnPct = Number(composites.directiveNonDirective?.percent ?? 0);

  const totalCRA =
    Math.round(((skillsPct * 1.3 + willPct * 1.45 + envPct * 1.25) / 4) * 100) /
    100;

  // ── Group averages ────────────────────────────────────────
  const grpSkills = groupAverages?.groupSkills ?? null;
  const grpWill = groupAverages?.groupWill ?? null;
  const grpEnv = groupAverages?.groupEnvironmentalSupport ?? null;
  const grpTotal = groupAverages?.total ?? 0;

  const grpSkillsLabel = grpSkills != null ? `${grpSkills}%` : "N/A";
  const grpWillLabel = grpWill != null ? `${grpWill}%` : "N/A";
  const grpEnvLabel = grpEnv != null ? `${grpEnv}%` : "N/A";

  const grpSkillsColor = grpSkills != null ? "#4caf50" : "#aaaaaa";
  const grpWillColor = grpWill != null ? "#ff9800" : "#aaaaaa";
  const grpEnvColor = grpEnv != null ? "#9c27b0" : "#aaaaaa";

  const skillsVsWill = getSkillsVsWill(skillsPct, willPct);
  const willVsEnv = getWillVsEnv(willPct, envPct);
  const envVsSkills = getEnvVsSkills(envPct, skillsPct);

  const totalResponses = Object.values(scores).reduce(
    (a, b) => a + (Number(b) || 0),
    0,
  );

  const scoreSpreadRows = Object.entries(scores)
    .filter(([, v]) => Number(v) > 0)
    .map(([score, count]) => {
      const pct =
        totalResponses > 0
          ? ((Number(count) / totalResponses) * 100).toFixed(2)
          : "0.00";
      const idx = parseInt(score, 10) - 1;
      const bg = SCORE_COLORS[Math.min(idx, 9)] || "#ccc";
      const textColor = idx < 2 ? "#000000" : "#ffffff";
      return `<tr>
        <td style="background-color:${bg};color:"#000000";padding:3px 6px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;width:90px;line-height:1.1;">Score ${score}</td>
        <td style="background-color:${bg};color:#000000";padding:3px 6px;font-size:20px;font-family:Arial,sans-serif;line-height:1.1;">${count} responses</td>
        <td style="background-color:${bg};color:#000000";padding:3px 6px;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;text-align:right;line-height:1.1;">${pct}%</td>
      </tr>`;
    })
    .join("");

  const scoresJson = JSON.stringify(scores);

  const candidateSummaryTable = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:2px solid #f5c842;border-radius:15px;background-color:#fffde7;margin-top:0px;margin-bottom:6px;">
    <tr><td style="padding:8px;">
  <table width="100%" cellpadding="4" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:6px;">
    <tr>
      <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;width:29%;"><b>Name:</b> ${candidateInfo.name ?? "—"}</td>
      <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;width:25%;"><b>Gender:</b> ${candidateInfo.gender ?? "—"}</td>
      <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;width:63px;"><b>Years in Organization:</b> ${candidateInfo.yearsInOrganization ?? "—"}</td>
    </tr>
    </table>
    <table width="90%" cellpadding="4" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:6px;">

    <tr>
      <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;width:23%;"><b>Age:</b> ${candidateInfo.age ?? "—"}</td>
      <td style="font-size:20px;font-family:Arial,sans-serif;color:#333;width:53%;"><b>Years in Position:</b> ${candidateInfo.yearsInPosition ?? "—"}</td>
      <td></td>
    </tr>
  </table>
  </td></tr>
  </table>`;
  function makeMiniBar(percent: number | null, fillColor: string): string {
    if (percent == null) {
      return `
        <div style="
          background:#f0f0f0;
          border-radius:12px;
          height:35px;
          line-height:35px;
          text-align:center;
          font-size:20px;
          font-family:Arial,sans-serif;
          color:#777;
        ">
          N/A
        </div>
      `;
    }

    const pct = Math.max(0, Math.min(100, Number(percent)));

    return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border-collapse:collapse;">
        <tr>
          <td width="${pct}%"
            style="
              background:${fillColor};
              height:35px;
              border-radius:12px 0 0 12px;
              color:#fff;
              font-weight:bold;
              font-size:20px;
              text-align:center;
              font-family:Arial,sans-serif;
            ">
            ${pct}%
          </td>
          <td width="${100 - pct}%"
            style="
              background:#e0e0e0;
              height:35px;
              border-radius:0 12px 12px 0;
            ">
          </td>
        </tr>
      </table>
    `;
  }
  // ── Composites table: Composites | Individual | Group ─────
  const compositesTable = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:2px solid #f5c842;border-radius:15px;background-color:#fffde7;margin-bottom:6px;">
      <tr><td style="padding:12px;">
<!-- Image -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="border-collapse:collapse;margin-top:-13px;margin-bottom:12px;">
    <tr>
      <td style="padding:0;">
        <img src="${CompositeImageBase64}"
             style="width:100%;max-height:180px;object-fit:contain;display:block;" />
      </td>
    </tr>
  </table>
        <!-- Column headers -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-bottom:1px solid #f5c842;margin-bottom:10px;padding-bottom:8px;">
          <tr>
            <td style="font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;width:34%;">Composites</td>
            <td style="font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;width:33%;">Individual Results</td>
            <td style="font-weight:bold;font-size:20px;font-family:Arial,sans-serif;color:#333;text-align:center;width:33%;">Group Results</td>
          </tr>
        </table>

        <!-- Rows -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">

          <!-- Skills -->
          <tr>
            <tr>
  <tr>
  <td width="34%" style="padding-right:15px;">
    ${makePill("#4caf50", "Skills", "", 260)}
  </td>

  <td width="33%" style="padding-right:15px;">
    ${makeMiniBar(skillsPct, "#4caf50")}
  </td>

  <td width="33%">
    ${makeMiniBar(grpSkills, "#4caf50")}
  </td>
</tr>
          </tr>
          <tr><td colspan="3" style="height:4px;"></td></tr>

          <!-- Will -->
          <tr>
            <td width="34%" style="padding-right:15px;">
            ${makePill("#ff9800", "Will", "", 260)}
            </td>

            <td width="33%" style="padding-right:15px;">
            ${makeMiniBar(willPct, "#ff9800")}
            </td>
<td width="34%">
  ${makeMiniBar(grpWill, "#ff9800")}
</td>
          </tr>
          <tr><td colspan="3" style="height:4px;"></td></tr>

          <!-- Environmental Support -->
          <tr>
            <td width="34%" style="padding-right:15px;">
            ${makePill("#9c27b0", "Environmental Support", "", 260)}
            </td>
            <td width="33%" style="padding-right:15px;">
  ${makeMiniBar(envPct, "#9c27b0")}
</td>
<td width="34%">
  ${makeMiniBar(grpEnv, "#9c27b0")}
</td>
          </tr>

<!-- Explanation statement -->
  <tr><td colspan="3" style="height:4px;"></td></tr>
  <tr>
    <td colspan="3" style="padding:6px;background-color:#fffde7;border-left:4px solid #fff3d7;border-radius:4px;">
      <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.4;margin:0;text-align:justify;">
        This section presents a direct comparison of your individual scores for each composite (
        <b style="color:#4caf50;">Skills</b>,
        <b style="color:#ff9800;">Will</b>, and
        <b style="color:#9c27b0;">Environmental Support</b>)
        against your group's average results. This allows us to see how you stand relative to your peers, highlighting strengths or areas for improvement in the broader context of your cohort.
      </p>
    </td>
  </tr>
        </table>


      </td></tr>
    </table>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    @page { size: 210mm 450mm; margin: 15px 15px 40px 15px; }
    body { font-family: Arial, sans-serif; padding: 14px; background-color: #fffde7; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-break { page-break-after: always; padding-bottom: 20px; }
  </style>
</head>
<body>

<!-- ═══════════════ PAGE 1 — INTRO ═══════════════ -->
<div class="page-break">

  <!-- Black header with logo -->
  <!-- Black header with logo -->
<div style="padding:0;margin-bottom:16px;margin-top:-14px;margin-right:-14px;margin-left:-14px;border-radius:8px;">
  ${
    logoBase64 && logoBase64.length > 100
      ? `<img src="${logoBase64}" style="max-width:1000px;max-height:230px;object-fit:contain;display:block;margin-left:auto;margin-right:0;" />`
      : `<p style="color:#f5c842;font-size:22px;font-weight:bold;font-family:Arial,sans-serif;margin:0;letter-spacing:2px;">avidity<span style="color:#ffffff;">®</span> international</p>`
  }
</div>

  <!-- Description paragraphs -->
  <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.2;margin:0 ;text-align:justify;">
    The Coach Readiness Assessment (CRA) evaluates participants against a set of clearly defined criteria, including skills, motivation, and beliefs, to identify individuals with the attributes needed for successful coaching implementation.
  </p>
  <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.2;margin:0 0 16px 0;text-align:justify;">
    This comprehensive approach helps identify potential roadblocks early, enabling proactive interventions and smoother program implementation.
  </p>

  <!-- Quote block -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:30px;">
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
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f5c842;border-radius:25px;margin-top:0px;margin-bottom:0px;">
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
            <img src="${cardImagesBase64[0]}" style="width:100%;max-height:220px;object-fit:contain;display:block;" />
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

<!-- ═══════════════ PAGE 2 — REPORT PAGE 1 ═══════════════ -->
<div class="page-break">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f5c842;border-radius:25px;margin-top:20px;margin-bottom:20px;">
  <tr>
    <td style="padding:10px;text-align:center;background-color:#000000;border-radius:25px;">
      <span style="font-weight:bold;font-size:30px;font-family:Arial,sans-serif;color:#ffeb00;">Candidate's Overall Summary</span>
    </td>
  </tr>
</table>
  ${candidateSummaryTable}  

<!-- Total CRA Score -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f5c842;border-radius:12px;margin-top:20px;margin-bottom:20px;clear:both;">
    <tr><td style="padding:12px 16px;background-color:#f5c842;border-radius:12px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-weight:bold;font-size:25px;font-family:Arial,sans-serif;color:#000;">Total CRA Score</td>
          <td style="font-weight:bold;font-size:25px;font-family:Arial,sans-serif;color:#000;text-align:right;">${totalCRA}%</td>
        </tr>
      </table>
    </td></tr>
  </table>


<!-- Perceived and Actual — Entire section inside one yellow container -->
     <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="
          border-collapse:separate;
          border-spacing:0;
          background:#fffde7;
          border:2px solid #f5c842;
          border-radius:15px;
          overflow:hidden;
          margin-bottom:20px;
        ">
  <tr>
    <td style="padding:12px;background-color:#fffde7;">

      <!-- Image -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;margin-top:-13px;margin-bottom:12px;">
        <tr>
          <td style="padding:0;">
            <img src="${actualskillsImageBase64}"
                 style="width:100%;max-height:180px;object-fit:contain;display:block;" />
          </td>
        </tr>
      </table>

      <!-- What They Think vs Where They Are -->
      <table width="100%" cellpadding="0" cellspacing="4" border="0"
             style="border-collapse:collapse;">
        <tr>

          <!-- What They Think -->
          <td width="48%" style="vertical-align:top;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border-collapse:collapse;background-color:#c8e6c9;border-radius:10px;">
              <tr>
                <td style="padding:10px;background-color:#c8e6c9;border-radius:10px;">
                  <p style="font-weight:bold;text-align:center;font-family:Arial,sans-serif;font-size:25px;color:#1b5e20;margin:0 0 6px 0;">
                    What They Think
                  </p>

                  ${makeBar(
                    Number(perceivedActual.whatTheyThinkPercent ?? 0),
                    "#66bb6a",
                    `${Number(perceivedActual.whatTheyThinkPercent ?? 0)}%`,
                  )}

                  ${pctTickRow()}
                </td>
              </tr>
            </table>
          </td>

          <td width="4%"></td>

          <!-- Where They Are -->
          <td width="48%" style="vertical-align:top;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border-collapse:collapse;background-color:#388e3c;border-radius:10px;">
              <tr>
                <td style="padding:10px;background-color:#388e3c;border-radius:10px;">
                  <p style="font-weight:bold;text-align:center;font-family:Arial,sans-serif;font-size:25px;color:#ffffff;margin:0 0 6px 0;">
                    Where They Are
                  </p>

                  ${makeBar(
                    Number(perceivedActual.whereTheyArePercent ?? 0),
                    "#1b5e20",
                    `${Number(perceivedActual.whereTheyArePercent ?? 0)}%`,
                  )}

                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-size:20px;color:#fff;font-family:Arial,sans-serif;">
                        0%
                      </td>
                      <td style="font-size:20px;color:#fff;font-family:Arial,sans-serif;text-align:right;">
                        100%
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>
          </td>

        </tr>
      </table>

      <!-- Explanation text -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;margin-top:12px;">
        <tr>
          <td style="padding:6px 12px;background-color:#fffde7;border-radius:4px;">

            <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.4;margin:0 0 8px 0;text-align:justify;">
              The charts above contrast your self-assessed coaching skills with your objectively measured skills.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border-collapse:collapse;margin-bottom:6px;">
              <tr>
                <td style="width:10px;vertical-align:top;padding-top:2px;">
                  <span style="color:#f5c842;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">•</span>
                </td>
                <td style="padding-left:6px;">
                  <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.4;margin:0;text-align:justify;">
                    <b style="color:#66bb6a;">What They Think:</b>
                    represents how you think you are in your abilities to coach.
                  </p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border-collapse:collapse;margin-bottom:6px;">
              <tr>
                <td style="width:10px;vertical-align:top;padding-top:2px;">
                  <span style="color:#f5c842;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">•</span>
                </td>
                <td style="padding-left:6px;">
                  <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.4;margin:0;text-align:justify;">
                    <b style="color:#1b5e20;">Where They Are:</b>
                    represents your actual coaching practice based on the assessment.
                  </p>
                </td>
              </tr>
            </table>

            <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.4;margin:0;font-style:italic;text-align:justify;">
              The gap between these two scores highlights the areas for growth to help you gain more accurate awareness and insight about yourself, guiding targeted development.
            </p>

          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>



  <!-- Composites: Individual + Group Results -->
  ${compositesTable}

  <!-- CRA Score Spread -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:2px solid #f5c842;border-radius:15px;margin-top:20px;background-color:#fffde7;">
    <tr><td style="padding:6px;">
      <!-- Image -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;margin-top:-8px;margin-bottom:12px;">
        <tr>
          <td style="padding:0;">
            <img src="${CRAImageBase64}"
                 style="width:100%;max-height:180px;object-fit:contain;display:block;" />
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f5c842;border-radius:10px;margin-top:0px;margin-bottom:12px;">
        <tr><td style="padding:4px 6px;background-color:#ffeb00;border-radius:10px;">
          <p style="font-size:20px;font-family:Arial,sans-serif;color:#000;margin:0;line-height:1.4;">This chart illustrates the percentage of scores chosen by candidates on a scale of 1 to 10 from all <b>${totalResponses}</b> statement responses in the Coach Readiness Assessment. Each slice represents how often a particular score was selected.</p>
        </td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="vertical-align:middle;text-align:center;width:45%;">
            <canvas id="pieChart" width="180" height="180"></canvas>
          </td>
          <td style="vertical-align:middle;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; margin-top:-5px;">
              ${scoreSpreadRows}
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>

</div>

<!-- ═══════════════ PAGE 3 — REPORT PAGE 2 ═══════════════ -->
<div class="page-break">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f5c842;border-radius:25px;margin-top:20px;margin-bottom:40px;">
    <tr>
      <td style="padding:10px;text-align:center;background-color:#000000;border-radius:25px;">
        <span style="font-weight:bold;font-size:30px;font-family:Arial,sans-serif;color:#ffeb00;">Detailed Composite Scores</span>
      </td>
    </tr>
  </table>

  <!-- Skills Composite -->
  ${makeSectionHeader("#2e7d32", "Skills Composite", `${skillsPct}%`)}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border-radius:10px;margin-bottom:40px;">
    <tr><td style="padding:6px;background-color:#ffffff;border-radius:10px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-radius:10px;">
        ${makeSubBar(Number(composites.skills?.["skill"] ?? 0), "#1b5e20", "Skill")}
        ${makeSubBar(Number(composites.skills?.["knowledge"] ?? 0), "#66bb6a", "Knowledge")}
        ${makeSubBar(Number(composites.skills?.["behavior"] ?? 0), "#4caf50", "Behavior")}
      </table>

      <tr><td style="padding:4px 8px;">
        <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;font-style:italic;">
          Your Skills Composite score reflects your coaching knowledge, behaviour, and practical coaching skills.
        </p>
      </td></tr>
    </td></tr>
  </table>

  <!-- Will Composite -->
  ${makeSectionHeader("#e65100", "Will Composite", `${willPct}%`)}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border-radius:10px;margin-bottom:40px;">
    <tr><td style="padding:6px;background-color:#ffffff;border-radius:10px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-radius:10px;">
        ${makeSubBar(Number(composites.will?.["motivation"] ?? 0), "#ff9800", "Motivation")}
        ${makeSubBar(Number(composites.will?.["confidence"] ?? 0), "#ffa726", "Confidence")}
        ${makeSubBar(Number(composites.will?.["commitment"] ?? 0), "#ffb74d", "Commitment")}
        ${makeSubBar(Number(composites.will?.["belief"] ?? 0), "#ffcc02", "Belief")}
      </table>

      <tr><td style="padding:4px 8px;">
        <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;font-style:italic;text-align:justify;">
          Your Will Composite score reflects your motivation, confidence, commitment, and belief in your ability to coach others effectively.
        </p>
      </td></tr>
    </td></tr>
  </table>

  <!-- Environmental Support Composite -->
  ${makeSectionHeader("#6a1b9a", "Environmental Support Composite", `${envPct}%`)}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border-radius:10px;margin-bottom:40px;">
    <tr><td style="padding:6px;background-color:#ffffff;border-radius:10px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-radius:10px;">
        ${makeSubBar(Number(composites.environmentalSupport?.["people"] ?? 0), "#4a148c", "People")}
        ${makeSubBar(Number(composites.environmentalSupport?.["organization"] ?? 0), "#9c27b0", "Organization")}
        ${makeSubBar(Number(composites.environmentalSupport?.["leadership"] ?? 0), "#ce93d8", "Leadership")}
      </table>

      <tr><td style="padding:4px 8px;">
        <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;font-style:italic;text-align:justify;">
          Your Environmental Support Composite score reflects the level of support available from your people, leaders, and organization.
        </p>
      </td></tr>
    </td></tr>
  </table>

  <!-- Directive vs Non-Directive -->
  ${makeSectionHeader("#1a237e", "Directive vs Non-Directive Scale", `${dnPct}%`)}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border-radius:10px;margin-bottom:40px;">
    <tr><td style="padding:6px;background-color:#ffffff;border-radius:10px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:12px;">
        <tr>
          <td>
          <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#2e7d32;border-radius:20px;"><tr><td style="background-color:#2e7d32;border-radius:20px;padding:4px 12px;color:#fff;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">Non-Directive</td></tr>
          </table></td>
          <td style="text-align:right;"><table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#e65100;border-radius:20px;float:right;"><tr><td style="background-color:#e65100;border-radius:20px;padding:4px 12px;color:#fff;font-weight:bold;font-size:20px;font-family:Arial,sans-serif;">Directive</td></tr></table></td>
        </tr>
      </table>
      ${makeBar(dnPct, "#1565c0", `${dnPct}%`)}

      <p style="text-align:center;font-weight:bold;font-size:25px;font-family:Arial,sans-serif;color:#333;margin:3px 0 0 0;">
        ${dnPct > 50 ? "Leans Directive" : dnPct < 50 ? "Leans Non-Directive" : "Balanced"}
      </p>
      <tr><td style="padding:4px 8px;">
        <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.5;margin:0;font-style:italic;text-align:justify;">
Your score indicates your preferred coaching approach and whether you naturally lean toward directing or facilitating others. 
        </p>        
      </td></tr>
    </td></tr>
  </table>

</div>

<!-- ═══════════════ PAGE 4 — REPORT PAGE 3 ═══════════════ -->
<div style="padding-bottom:20px;">
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

        <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.6;margin:0 0 8px 0;text-align:justify;">
          Coaching success depends on more than skills alone. This section evaluates the balance and interaction between coaching capability (<b style="color:#2e7d32;">Skills</b>), coaching motivation (<b style="color:#e65100;">Will</b>), and support (<b style="color:#6a1b9a;">Environmental Support</b>).
        </p>

        <p style="font-size:20px;font-family:Arial,sans-serif;color:#333;line-height:1.6;margin:0 0 10px 0;text-align:justify;">
          The resulting insights will help you determine where interventions should be focused to maximize coaching adoption, effectiveness, and long-term sustainability.
        </p>

       <!-- Image --> 
       <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:20px;margin-bottom:12px;"> <tr> <td style="padding:0;"> <img src="${CompareImageBase64}" style="width:100%;max-height:230px;object-fit:contain;display:block;" /> </td> </tr> </table>

      </td></tr>
    </table>
  ${[
    {
      leftLabel: "Skills",
      leftColor: "#2e7d32",
      leftPct: skillsPct,
      rightLabel: "Will",
      rightColor: "#e65100",
      rightPct: willPct,
      ...skillsVsWill,
    },
    {
      leftLabel: "Will",
      leftColor: "#e65100",
      leftPct: willPct,
      rightLabel: "Environmental Support",
      rightColor: "#6a1b9a",
      rightPct: envPct,
      ...willVsEnv,
    },
    {
      leftLabel: "Environmental Support",
      leftColor: "#6a1b9a",
      leftPct: envPct,
      rightLabel: "Skills",
      rightColor: "#2e7d32",
      rightPct: skillsPct,
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
                <td style="color:#fff;font-weight:bold;font-size:25px;font-family:Arial,sans-serif;text-align:right;">${c.leftPct}%</td>
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
                <td style="color:#fff;font-weight:bold;font-size:25px;font-family:Arial,sans-serif;text-align:right;">${c.rightPct}%</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <div style="background:white;border-radius:12px;padding:14px;box-shadow:0 0px 0px rgba(0,0,0,0.1);">
        <p style="font-weight:bold;border-radius:15px;background-color:#ffed00;text-align:center;font-size:25px;font-family:Arial,sans-serif;margin:0 0 8px 0;">${c.title}</p>
        <p style="font-size:20px;text-align:center;color:#333;line-height:1.6;font-family:Arial,sans-serif;margin:0;">${c.statement}</p>
      </div>
    </div>
  `,
    )
    .join("")}
</div>


<script>
// Pie chart
(function() {
  var scores = ${scoresJson};
  var colors = ${JSON.stringify(SCORE_COLORS)};
  var canvas = document.getElementById('pieChart');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var entries = Object.entries(scores);
  var total = entries.reduce(function(a, e) { return a + (Number(e[1]) || 0); }, 0);
  if (total <= 0) return;
  var cx = 85, cy = 85, radius = 80;
  var startAngle = -Math.PI / 2;
  entries.forEach(function(e, i) {
    var count = Number(e[1]) || 0;
    if (count <= 0) return;
    var sliceAngle = (count / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i] || '#ccc';
    ctx.fill();
    startAngle += sliceAngle;
  });
})();

// Composite quadrant chart
(function() {
  var canvas = document.getElementById('compositeChart');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var cx = 330, cy = 280, r = 240;

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
