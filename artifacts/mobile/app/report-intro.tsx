import React, { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Line, Path, Text as SvgText } from "react-native-svg";

import type {
  CandidateInfo,
  Composites,
  PerceivedActual,
} from "@/components/ReportPage1Content";

function safeParse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const HIGHLIGHT_CARDS = [
  {
    num: "1",
    label: "Skill Composite",
    sub: "• Coaching Competencies",
    bg: "#2e7d32",
  },
  {
    num: "2",
    label: "Will Composite",
    sub: "• Mental Preparedness to Coach",
    bg: "#e65100",
  },
  {
    num: "3",
    label: "Environmental Support Composite",
    sub: "• Coaching Setting",
    bg: "#6a1b9a",
  },
  {
    num: "4",
    label: "Directive vs. Non-Directive Scale",
    sub: "• Coaching vs. Consultant Approach",
    bg: "#1a237e",
  },
];

function OverviewDiagram() {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 120;

  return (
    <View style={{ alignItems: "center", marginBottom: 24 }}>
      <Svg
        width={size + 100}
        height={size + 40}
        viewBox={`-60 -40 ${size + 120} ${size + 80}`}
      >
        <Path
          d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx - r} ${cy} Z`}
          fill="#2e7d32"
        />
        <Path
          d={`M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx} ${cy - r} Z`}
          fill="#e65100"
        />
        <Path
          d={`M ${cx} ${cy} L ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`}
          fill="#1a237e"
        />
        <Path
          d={`M ${cx} ${cy} L ${cx} ${cy + r} A ${r} ${r} 0 0 0 ${cx + r} ${cy} Z`}
          fill="#6a1b9a"
        />
        <Line
          x1={cx}
          y1={cy - r - 5}
          x2={cx}
          y2={cy + r + 5}
          stroke="#fffde7"
          strokeWidth={3}
        />
        <Line
          x1={cx - r - 5}
          y1={cy}
          x2={cx + r + 5}
          y2={cy}
          stroke="#fffde7"
          strokeWidth={3}
        />
        <SvgText
          x={cx - 55}
          y={cy - 45}
          fill="white"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          Skill
        </SvgText>
        <SvgText
          x={cx - 55}
          y={cy - 35}
          fill="white"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          Composite
        </SvgText>
        <SvgText
          x={cx + 55}
          y={cy - 45}
          fill="white"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          Will
        </SvgText>
        <SvgText
          x={cx + 55}
          y={cy - 35}
          fill="white"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          Composite
        </SvgText>
        <SvgText
          x={cx - 55}
          y={cy + 40}
          fill="white"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
        >
          Directive vs.
        </SvgText>
        <SvgText
          x={cx - 55}
          y={cy + 52}
          fill="white"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
        >
          Non-Directive
        </SvgText>
        <SvgText
          x={cx - 55}
          y={cy + 64}
          fill="white"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
        >
          Scale
        </SvgText>
        <SvgText
          x={cx + 55}
          y={cy + 40}
          fill="white"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
        >
          Environmental
        </SvgText>
        <SvgText
          x={cx + 55}
          y={cy + 52}
          fill="white"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
        >
          Support
        </SvgText>
        <SvgText
          x={cx + 55}
          y={cy + 64}
          fill="white"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
        >
          Composite
        </SvgText>
        <SvgText
          x={cx - r + 28}
          y={cy - 80}
          fill="#1A1A1A"
          fontSize="11"
          textAnchor="end"
        >
          Skill
        </SvgText>
        <SvgText
          x={cx - r + 18}
          y={cy - 65}
          fill="#1A1A1A"
          fontSize="11"
          textAnchor="end"
        >
          Behavior
        </SvgText>
        <SvgText
          x={cx - r + 9}
          y={cy - 50}
          fill="#1A1A1A"
          fontSize="11"
          textAnchor="end"
        >
          Knowledge
        </SvgText>
        <SvgText
          x={cx + r - 45}
          y={cy - 100}
          fill="#1A1A1A"
          fontSize="11"
          textAnchor="start"
        >
          Motivation
        </SvgText>
        <SvgText
          x={cx + r - 33}
          y={cy - 85}
          fill="#1A1A1A"
          fontSize="11"
          textAnchor="start"
        >
          Confidence
        </SvgText>
        <SvgText
          x={cx + r - 21}
          y={cy - 70}
          fill="#1A1A1A"
          fontSize="11"
          textAnchor="start"
        >
          Belief
        </SvgText>
        <SvgText
          x={cx + r - 13}
          y={cy - 55}
          fill="#1A1A1A"
          fontSize="11"
          textAnchor="start"
        >
          Commitment
        </SvgText>
        <SvgText
          x={cx + r - 10}
          y={cy + 60}
          fill="#1A1A1A"
          fontSize="11"
          textAnchor="start"
        >
          People
        </SvgText>
        <SvgText
          x={cx + r - 18}
          y={cy + 75}
          fill="#1A1A1A"
          fontSize="11"
          textAnchor="start"
        >
          Leadership
        </SvgText>
        <SvgText
          x={cx + r - 30}
          y={cy + 90}
          fill="#1A1A1A"
          fontSize="11"
          textAnchor="start"
        >
          Organization
        </SvgText>
      </Svg>
    </View>
  );
}

export default function ReportIntroScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    submittedAt?: string;
    totalResponses?: string;
    scores?: string;
    candidateInfo?: string;
    perceivedActual?: string;
    composites?: string;
    groupId?: string;
  }>();

  const candidateInfo = useMemo<CandidateInfo>(
    () => safeParse<CandidateInfo>(params.candidateInfo, {}),
    [params.candidateInfo],
  );
  const perceivedActual = useMemo<PerceivedActual>(
    () => safeParse<PerceivedActual>(params.perceivedActual, {}),
    [params.perceivedActual],
  );
  const composites = useMemo<Composites>(
    () => safeParse<Composites>(params.composites, {}),
    [params.composites],
  );
  const totalResponses = Number(params.totalResponses ?? 0);
  const submittedAt = params.submittedAt ?? new Date().toISOString();
  const scores: Record<string, number> = useMemo(() => {
    try {
      return params.scores ? JSON.parse(params.scores) : {};
    } catch {
      return {};
    }
  }, [params.scores]);

  const goToReport = () => {
    router.push({
      pathname: "/report-page-3",
      params: {
        submittedAt,
        totalResponses: String(totalResponses),
        scores: JSON.stringify(scores),
        candidateInfo: JSON.stringify(candidateInfo),
        perceivedActual: JSON.stringify(perceivedActual),
        composites: JSON.stringify(composites),
        groupId: params.groupId ?? "",
      },
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
          />
        </View>
        <View style={styles.body}>
          <Text style={styles.para}>
            The Coach Readiness Assessment (CRA) focuses on evaluating
            participants based on clear criteria, including skills, motivation,
            and beliefs, to ensure the identification of individuals with the
            right attributes for successful coaching implementation.
          </Text>
          <Text style={styles.para}>
            This comprehensive approach anticipates potential roadblocks,
            allowing us to proactively address and mitigate obstacles for
            smoother program implementation.
          </Text>
          <View style={styles.quoteBlock}>
            <View style={styles.quoteBar} />
            <View style={styles.quoteInner}>
              <Text style={styles.quoteMarkOpen}>{"\u201C"}</Text>
              <Text style={styles.quoteText}>
                The CRA aims to establish a more objective and data-driven
                approach to selecting participants for people coaching roles
                within organizations.
              </Text>
              <Text style={styles.quoteMarkClose}>{"\u201D"}</Text>
            </View>
          </View>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>This report highlights:</Text>
          </View>
          <View style={styles.cardGrid}>
            {HIGHLIGHT_CARDS.map((card) => (
              <View
                key={card.num}
                style={[styles.card, { backgroundColor: card.bg }]}
              >
                <View style={styles.cardCircle}>
                  <Text style={styles.cardNum}>{card.num}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardLabel}>{card.label}</Text>
                  <Text style={styles.cardSub}>{card.sub}</Text>
                </View>
              </View>
            ))}
          </View>
          <OverviewDiagram />
        </View>
      </ScrollView>
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={goToReport} style={styles.continueButton}>
          <Text style={styles.continueButtonText}>View Report →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fffde7" },
  scroll: { flex: 1, backgroundColor: "#fffde7" },
  scrollContent: { paddingBottom: 40 },
  header: {
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 28,
  },
  logo: { width: 189, height: 68, borderRadius: 8 },
  body: { padding: 18 },
  para: {
    fontSize: 16,
    color: "#1A1A1A",
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: "Inter_400Regular",
  },
  quoteBlock: { flexDirection: "row", marginBottom: 24, marginTop: 8 },
  quoteBar: {
    width: 4,
    backgroundColor: "#f5c842",
    borderRadius: 2,
    marginRight: 12,
  },
  quoteInner: { flex: 1 },
  quoteMarkOpen: {
    fontSize: 40,
    color: "#f5c842",
    lineHeight: 40,
    fontFamily: "Inter_700Bold",
  },
  quoteText: {
    fontSize: 15,
    color: "#1A1A1A",
    lineHeight: 22,
    fontFamily: "Inter_700Bold",
    fontWeight: "bold",
  },
  quoteMarkClose: {
    fontSize: 40,
    color: "#f5c842",
    lineHeight: 44,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  banner: {
    backgroundColor: "#f5c842",
    borderRadius: 25,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter_700Bold",
    color: "#000000",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 40,
    padding: 12,
    width: "48%",
    gap: 1,
  },
  cardCircle: {
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: "#2c2c2c",
    alignItems: "center",
    justifyContent: "center",
  },
  cardNum: {
    color: "#ffffff",
    fontWeight: "bold",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  cardLabel: {
    color: "#ffffff",
    fontWeight: "bold",
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  cardSub: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  continueButton: {
    backgroundColor: "#f5c842",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonRow: { paddingHorizontal: 18, backgroundColor: "#fffde7" },
  continueButtonText: {
    fontWeight: "bold",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#000000",
  },
});
