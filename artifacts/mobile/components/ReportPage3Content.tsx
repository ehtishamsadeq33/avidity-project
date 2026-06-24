import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Composites } from "@/components/ReportPage1Content";

function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

function pct(value: number | undefined): number {
  return round2(Number(value ?? 0));
}

function compare(a: number, b: number): "<" | ">" | "=" {
  if (Math.abs(a - b) <= 5) return "=";
  return a > b ? ">" : "<";
}

function StatementCard({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.statementCard}>
      <Text style={styles.statementTitle}>{title}</Text>
      <Text style={styles.statementText}>{text}</Text>
    </View>
  );
}

function ComparisonRow({
  leftName, leftPct, rightName, rightPct, leftColor, rightColor, symbol,
}: {
  leftName: string; leftPct: number; rightName: string; rightPct: number;
  leftColor: string; rightColor: string; symbol: ">" | "<" | "=";
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.pill, { backgroundColor: leftColor }]}>
        <Text style={styles.pillLabel} numberOfLines={2}>{leftName}</Text>
        <Text style={styles.pillPct}>{leftPct}%</Text>
      </View>
      <View style={styles.circle}>
        <Text style={styles.circleText}>{symbol}</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: rightColor }]}>
        <Text style={styles.pillLabel} numberOfLines={2}>{rightName}</Text>
        <Text style={styles.pillPct}>{rightPct}%</Text>
      </View>
    </View>
  );
}

type Props = {
  composites: Composites;
};

export default function ReportPage3Content({ composites }: Props) {
  const skillsPct = pct(composites.skills?.percent);
  const willPct = pct(composites.will?.percent);
  const envPct = pct(composites.environmentalSupport?.percent);

  const sw = compare(skillsPct, willPct);
  const we = compare(willPct, envPct);
  const es = compare(envPct, skillsPct);

  const swTitle =
    sw === ">"
      ? "Skills are higher than Will"
      : sw === "<"
        ? "Skills are lower than Will"
        : "Skills are equal or close to Will";
  const weTitle =
    we === ">"
      ? "Will is higher than Environmental Support"
      : we === "<"
        ? "Will is lower than Environmental Support"
        : "Will is equal or close to Environmental Support";
  const esTitle =
    es === ">"
      ? "Environmental Support is higher than Skills"
      : es === "<"
        ? "Environmental Support is lower than Skills"
        : "Environmental Support is equal or close to Skills";

  const swText =
    sw === ">"
      ? skillsPct > 70 && willPct > 70
        ? "The candidate has strong abilities and knowledge in coaching, but may lack motivation, belief, confidence, or commitment to coach at their best. They may benefit from help in identifying personal and professional goals that inspire and increase their will to coach. Providing additional resources such as working with a mentor or coach for guidance and support to increase their will could lead to more effective coaching outcomes."
        : "The candidate possesses stronger coaching capabilities than motivation or belief in their ability to coach. Despite having the technical know-how, their lack of will may hinder action and impact. Focus on reigniting their internal motivation by aligning coaching with meaningful personal or professional goals and offering encouragement through coaching communities or mentors."
      : sw === "<"
        ? skillsPct > 70 && willPct > 70
          ? "The candidate demonstrates commendable motivation, confidence, and commitment to coach, but may need further training or knowledge development to fully realize their coaching potential. Enroll them in coach training programs to expand their knowledge and seek opportunities for them to apply coaching skills in practical settings. Partner them with skilled coaches for best practices and insights."
          : "Despite showing strong motivation to coach, the candidate lacks the skills to act effectively. This can lead to discouragement over time. Providing foundational coaching education, feedback-rich experiences, and support through skilled coaching partners will help build confidence and accelerate development."
        : skillsPct >= 70 || willPct >= 70
          ? "The candidate's abilities and knowledge in coaching are equal to their motivation, belief, confidence, and commitment. This balance suggests a well-rounded approach to coaching, as the candidate can leverage both their skills and their will to achieve effective coaching outcomes."
          : "The candidate's coaching abilities and motivation are equally limited. This, while balanced, reflects a need for foundational development on both fronts. Without sufficient skill or internal drive, coaching effectiveness is unlikely to emerge. Support should focus on building core knowledge while simultaneously working to inspire commitment and belief in their coaching potential.";

  const weText =
    we === ">"
      ? willPct > 70 && envPct > 70
        ? "The candidate's personal drive and commitment to coach are commendable, but they may lack adequate support to thrive as a coach in their environment. This deficiency could affect their morale and overall coaching performance over time. The organization and its members should provide additional support to the candidate, focusing on fostering a coaching culture that aligns with candidate's goals."
        : willPct > 70 && envPct < 70
          ? "The candidate has commendable personal drive but lacks the external conditions needed to thrive. This imbalance may lead to frustration or burnout. The organization should work to close this gap by ensuring coaching is recognized, supported, and embedded in culture and leadership practice, providing platforms and tools to support their coaching efforts."
          : "The candidate is experiencing low personal motivation alongside minimal external support. This combination can severely restrict their ability to engage in coaching or see its relevance. Without a spark of internal drive or a nurturing environment, coaching is unlikely to take root. Interventions should aim to inspire the candidate, help them find personal meaning in coaching, while simultaneously improving the organizational climate with accessible support systems."
      : we === "<"
        ? willPct > 70 && envPct > 70
          ? "The candidate receives substantial support from their environment to thrive as a coach, but may need to boost their motivation, confidence, or belief to fully capitalize on that support. They could benefit from working with a mentor or coach to establish personal and professional goals that inspire them. Increasing their will through tailored coaching support can enhance their performance and overall success."
          : willPct < 70 && envPct > 70
            ? "The candidate is surrounded by encouraging structures but struggles to find the internal drive to coach. Without addressing this, even the best resources may go unused. Increase personal motivation by helping the candidate uncover their purpose for coaching and connect it to professional fulfillment. Small wins can help build momentum and belief."
            : "Despite showing strong motivation to coach, the candidate lacks the skills to act effectively. This can lead to discouragement over time. Providing foundational coaching education, feedback-rich experiences, and support through skilled coaching partners will help build confidence and accelerate development."
        : willPct >= 70 || envPct >= 70
          ? "The candidate's personal drive and commitment to coaching are equal with the level of support they receive from their environment. This balance can contribute to a positive coaching experience, as the candidate can thrive with both intrinsic motivation and external support."
          : "The candidate's motivation and the support they receive are equally insufficient, which may result in disengagement or lack of initiative in coaching. Even if the individual sees the value in coaching, the lack of environmental reinforcement or personal drive could stall growth. Interventions should include creating visible support systems while cultivating personal investment in coaching success.";

  const esText =
    es === ">"
      ? envPct > 70 && skillsPct > 70
        ? "The candidate is benefiting from strong support from their environment that provides them with the motivation and resources to coach. However, they may need to further develop their coaching skills to fully capitalize on this support. To aid in their growth, identify areas of coaching skill improvement and seek targeted interventions. Provide opportunities for hands-on coaching practice and learning, and collaborate with coaches for best practices and insights."
        : envPct > 70 && skillsPct < 70
          ? "Though the environment is conducive to coaching, the candidate may not yet have the skills to make use of this support. They risk missing opportunities if their coaching capabilities are not developed. Address this gap by providing targeted training, hands-on experiences, and access to experienced coaches who can support their progression."
          : "The candidate lacks both the capabilities required for coaching and the environmental structures to support their development. This creates a significant barrier to progress, as neither individual readiness nor external conditions are present. The focus should be on building foundational coaching knowledge in a psychologically safe and encouraging environment. Provide structured, bite-sized learning, regular check-ins, and a strong community of practice to slowly shift both capability and culture."
      : es === "<"
        ? envPct > 70 && skillsPct > 70
          ? "The candidate has the necessary knowledge of coaching skills, but may not be receiving sufficient support from their environment to thrive as a coach, which could negatively affect their morale and performance over time. The organization should enhance support for the candidate, potentially by strengthening the coaching culture and aligning it with the candidate's goals to ensure their long-term success as a coach."
          : envPct < 70 && skillsPct > 70
            ? "The candidate has coaching capabilities but is not adequately supported by their environment. This lack of alignment may lead to decreased morale or underutilized potential. Organizations should bolster the support system, through leadership buy-in, time allocation, or peer networks, so that the candidate can thrive and remain committed to their growth as a coach."
            : "Despite showing strong motivation to coach, the candidate lacks the skills to act effectively. This can lead to discouragement over time. Providing foundational coaching education, feedback-rich experiences, and support through skilled coaching partners will help build confidence and accelerate development."
        : envPct >= 70 || skillsPct >= 70
          ? "The candidate's support from their environment aligns with their level of coaching abilities and knowledge. This balance can facilitate the candidate's growth and performance as a coach, as they can utilize the available resources and opportunities to enhance their skills."
          : "The candidate's current skill and environmental support are equally inadequate, limiting their capacity to coach effectively. This reveals that even if the individual has some interest or potential, both external resources and coaching competence must be developed in tandem. Consider structured learning, early application opportunities, and an improved coaching culture to foster growth.";

  return (
    <View>
      <Text style={styles.title}>What do your results mean?</Text>

      <View style={styles.section}>
        <ComparisonRow
          leftName="Skills"
          leftPct={skillsPct}
          rightName="Will"
          rightPct={willPct}
          leftColor="#2e7d32"
          rightColor="#e65100"
          symbol={sw}
        />
        <StatementCard title={swTitle} text={swText} />
      </View>

      <View style={styles.section}>
        <ComparisonRow
          leftName="Will"
          leftPct={willPct}
          rightName="Environmental Support"
          rightPct={envPct}
          leftColor="#e65100"
          rightColor="#6a1b9a"
          symbol={we}
        />
        <StatementCard title={weTitle} text={weText} />
      </View>

      <View style={styles.section}>
        <ComparisonRow
          leftName="Environmental Support"
          leftPct={envPct}
          rightName="Skills"
          rightPct={skillsPct}
          leftColor="#6a1b9a"
          rightColor="#2e7d32"
          symbol={es}
        />
        <StatementCard title={esTitle} text={esText} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  section: { marginBottom: 18 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  pill: {
    flex: 1,
    borderRadius: 25,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pillLabel: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
    flex: 1,
    flexWrap: "wrap",
  },
  pillPct: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
    flexShrink: 0,
    marginLeft: 4,
    minWidth: 48,
    textAlign: "right",
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5c842",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  circleText: { fontSize: 18, fontWeight: "bold", color: "#000" },
  statementCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    textDecorationLine: "underline",
    textAlign: "center",
    marginBottom: 10,
  },
  statementText: {
    fontSize: 14,
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 20,
  },
});
