import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { G, Line, Rect, Text as SvgText } from "react-native-svg";

import type {
  CandidateInfo,
  Composites,
} from "@/components/ReportPage1Content";

export interface GroupCandidate {
  name: string;
  skills: number;
  will: number;
  environmentalSupport: number;
}

export interface GroupAverages {
  total: number;
  groupSkills: number | null;
  groupWill: number | null;
  groupEnvironmentalSupport: number | null;
  candidates: GroupCandidate[];
}

type BarRow = { label: string; value: number; color: string };

function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

const CHART_WIDTH = Dimensions.get("window").width - 32;
const LABEL_WIDTH = 80;
const DND_SVG_WIDTH = Dimensions.get("window").width - 48;
const DND_LEFT_OFFSET = 30;
const BAR_HEIGHT = 22;
const BAR_GAP = 14;
const AXIS_HEIGHT = 28;

function ScaleBarChart({ rows, max }: { rows: BarRow[]; max: number }) {
  const barStartX = LABEL_WIDTH + 10;
  const availableBarWidth = CHART_WIDTH - LABEL_WIDTH - 20;
  const chartHeight =
    rows.length * BAR_HEIGHT + (rows.length - 1) * BAR_GAP + AXIS_HEIGHT + 8;
  const ticks = Array.from({ length: max + 1 }, (_, i) => i);

  return (
    <Svg width={CHART_WIDTH} height={chartHeight}>
      <G>
        {rows.map((r, i) => {
          const y = i * (BAR_HEIGHT + BAR_GAP);
          const w = (r.value / 10) * availableBarWidth;
          const labelWidth = r.label.length * 6;
          const isInside = barStartX + w + labelWidth > CHART_WIDTH;
          return (
            <G key={r.label}>
              <SvgText
                x={5}
                y={y + BAR_HEIGHT / 2 + 4}
                fontSize={10}
                fontWeight="700"
                fill="#1A1A1A"
                textAnchor="start"
              >
                {r.label}
              </SvgText>
              <Rect
                x={barStartX}
                y={y}
                width={availableBarWidth}
                height={BAR_HEIGHT}
                fill="#f5f5f5"
                rx={4}
              />
              <Rect
                x={barStartX}
                y={y}
                width={w}
                height={BAR_HEIGHT}
                fill={r.color}
                rx={4}
              />
              <SvgText
                x={isInside ? barStartX + w - 5 : barStartX + w + 5}
                y={y + BAR_HEIGHT / 2 + 4}
                fontSize={11}
                fontWeight="700"
                fill={isInside ? "#FFFFFF" : "#333333"}
                textAnchor={isInside ? "end" : "start"}
              >
                {r.value.toFixed(2)}
              </SvgText>
            </G>
          );
        })}
      </G>
      <G>
        <Line
          x1={barStartX}
          y1={rows.length * BAR_HEIGHT + (rows.length - 1) * BAR_GAP + 4}
          x2={barStartX + availableBarWidth}
          y2={rows.length * BAR_HEIGHT + (rows.length - 1) * BAR_GAP + 4}
          stroke="#888"
          strokeWidth={1}
        />
        {ticks.map((t) => {
          const x = barStartX + (t / 10) * availableBarWidth;
          const y = rows.length * BAR_HEIGHT + (rows.length - 1) * BAR_GAP + 4;
          return (
            <G key={t}>
              <Line
                x1={x}
                y1={y}
                x2={x}
                y2={y + 4}
                stroke="#888"
                strokeWidth={1}
              />
              <SvgText
                x={x}
                y={y + 16}
                fontSize={9}
                fill="#555"
                textAnchor={t === 10 ? "end" : "middle"}
              >
                {`${t}`}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
}

function PercentBarChart({ value }: { value: number }) {
  const innerWidth = CHART_WIDTH;
  const v = clamp(value, 0, 100);
  const w = (v / 100) * innerWidth;
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const barY = 0;

  return (
    <Svg width={DND_SVG_WIDTH} height={BAR_HEIGHT + AXIS_HEIGHT + 4}>
      <Rect
        x={DND_LEFT_OFFSET}
        y={barY}
        width={innerWidth}
        height={BAR_HEIGHT}
        fill="#eeeeee"
        rx={4}
      />
      <Rect
        x={DND_LEFT_OFFSET}
        y={barY}
        width={w}
        height={BAR_HEIGHT}
        fill="#1565c0"
        rx={4}
      />
      <SvgText
        x={DND_LEFT_OFFSET + Math.max(w / 2, 22)}
        y={barY + BAR_HEIGHT / 2 + 4}
        fontSize={11}
        fontWeight="700"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        {`${v.toFixed(1)}%`}
      </SvgText>
      <G>
        <Line
          x1={DND_LEFT_OFFSET}
          y1={barY + BAR_HEIGHT + 4}
          x2={DND_LEFT_OFFSET + innerWidth}
          y2={barY + BAR_HEIGHT + 4}
          stroke="#888"
          strokeWidth={1}
        />
        {ticks.map((t) => {
          const x = DND_LEFT_OFFSET + (t / 100) * innerWidth;
          const y = barY + BAR_HEIGHT + 4;
          return (
            <G key={t}>
              <Line
                x1={x}
                y1={y}
                x2={x}
                y2={y + 4}
                stroke="#888"
                strokeWidth={1}
              />
              <SvgText
                x={x}
                y={y + 16}
                fontSize={9}
                fill="#555"
                textAnchor={t === 100 ? "end" : "middle"}
              >
                {t === 0 || t === 100 ? `${t}%` : `${t}`}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
}

function Legend({ rows }: { rows: BarRow[] }) {
  return (
    <View style={styles.legend}>
      {rows.map((r) => (
        <View key={r.label} style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: r.color }]} />
          <Text style={styles.legendText}>{r.label}</Text>
        </View>
      ))}
    </View>
  );
}

function fmt(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "N/A";
  return `${v.toFixed(1)}%`;
}

type Props = {
  candidateInfo: CandidateInfo;
  composites: Composites;
  groupAverages?: GroupAverages | null;
};

export default function ReportPage2Content({
  candidateInfo,
  composites,
  groupAverages,
}: Props) {
  const skills = composites.skills ?? {};
  const will = composites.will ?? {};
  const env = composites.environmentalSupport ?? {};
  const dnd = composites.directiveNonDirective ?? {};

  const skillsPct = Number(skills.percent ?? 0);
  const willPct = Number(will.percent ?? 0);
  const envPct = Number(env.percent ?? 0);
  const dndPct = Number(dnd.percent ?? 0);
  const totalCRAScore = round2(
    (skillsPct * 1.3 + willPct * 1.45 + envPct * 1.25) / 4,
  );

  const skillsRows: BarRow[] = [
    { label: "Skill", value: Number(skills.skill ?? 0), color: "#1b5e20" },
    {
      label: "Knowledge",
      value: Number(skills.knowledge ?? 0),
      color: "#a5d6a7",
    },
    {
      label: "Behavior",
      value: Number(skills.behavior ?? 0),
      color: "#4caf50",
    },
  ];

  const willRows: BarRow[] = [
    {
      label: "Motivation",
      value: Number(will.motivation ?? 0),
      color: "#fff9c4",
    },
    {
      label: "Confidence",
      value: Number(will.confidence ?? 0),
      color: "#ffe0b2",
    },
    {
      label: "Commitment",
      value: Number(will.commitment ?? 0),
      color: "#f9a825",
    },
    { label: "Believe", value: Number(will.belief ?? 0), color: "#f57f17" },
  ];

  const envRows: BarRow[] = [
    { label: "People", value: Number(env.people ?? 0), color: "#4a148c" },
    {
      label: "Organization",
      value: Number(env.organization ?? 0),
      color: "#9c27b0",
    },
    {
      label: "Leadership",
      value: Number(env.leadership ?? 0),
      color: "#ce93d8",
    },
  ];

  const summaryRows = [
    {
      label: "Skills",
      composite: skillsPct,
      individual: skillsPct,
      group: groupAverages?.groupSkills ?? null,
    },
    {
      label: "Will",
      composite: willPct,
      individual: willPct,
      group: groupAverages?.groupWill ?? null,
    },
    {
      label: "Env. Support",
      composite: envPct,
      individual: envPct,
      group: groupAverages?.groupEnvironmentalSupport ?? null,
    },
  ];

  const hasGroupData =
    groupAverages != null && (groupAverages.candidates?.length ?? 0) > 0;

  return (
    <View collapsable={false} style={styles.captureRoot}>
      <View style={styles.infoContainer}>
        <View style={styles.infoColumn}>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Name: </Text>
            {candidateInfo.name ?? "—"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Gender: </Text>
            {candidateInfo.gender ?? "—"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Age: </Text>
            {candidateInfo.age ?? "—"}
          </Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Years in Organization: </Text>
            {candidateInfo.yearsInOrganization ?? "—"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Years in Position: </Text>
            {candidateInfo.yearsInPosition ?? "—"}
          </Text>
        </View>
      </View>

      <View style={styles.totalBanner}>
        <Text style={styles.totalBannerText}>Total CRA Score</Text>
        <Text style={styles.totalBannerText}>{totalCRAScore}%</Text>
      </View>

      <View style={styles.compositeBlock}>
        <View style={[styles.compHeader, { backgroundColor: "#2e7d32" }]}>
          <Text style={styles.compHeaderText}>Skills Composite</Text>
          <Text style={styles.compHeaderText}>{skillsPct}%</Text>
        </View>
        <View style={styles.compCard}>
          <ScaleBarChart rows={skillsRows} max={10} />
          <Legend rows={skillsRows} />
        </View>
      </View>

      <View style={styles.compositeBlock}>
        <View style={[styles.compHeader, { backgroundColor: "#e65100" }]}>
          <Text style={styles.compHeaderText}>Will Composite</Text>
          <Text style={styles.compHeaderText}>{willPct}%</Text>
        </View>
        <View style={styles.compCard}>
          <ScaleBarChart rows={willRows} max={10} />
          <Legend rows={willRows} />
        </View>
      </View>

      <View style={styles.compositeBlock}>
        <View style={[styles.compHeader, { backgroundColor: "#6a1b9a" }]}>
          <Text style={styles.compHeaderText}>
            Environmental Support Composite
          </Text>
          <Text style={styles.compHeaderText}>{envPct}%</Text>
        </View>
        <View style={styles.compCard}>
          <ScaleBarChart rows={envRows} max={10} />
          <Legend rows={envRows} />
        </View>
      </View>

      <View style={styles.compositeBlock}>
        <View style={[styles.compHeader, { backgroundColor: "#1a237e" }]}>
          <Text style={styles.compHeaderText}>
            Directive vs Non-Directive Scale
          </Text>
          <Text style={styles.compHeaderText}>{dndPct}%</Text>
        </View>
        <View style={styles.compCard}>
          <View style={styles.dndPillsRow}>
            <View style={[styles.dndPill, { backgroundColor: "#2e7d32" }]}>
              <Text style={styles.dndPillText}>Non-Directive</Text>
            </View>
            <View style={[styles.dndPill, { backgroundColor: "#e65100" }]}>
              <Text style={styles.dndPillText}>Directive</Text>
            </View>
          </View>
          <PercentBarChart value={dndPct} />
          <Text style={styles.dndLeans}>
            {dndPct > 50
              ? "Leans Directive"
              : dndPct < 50
                ? "Leans Non-Directive"
                : "Balanced"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  captureRoot: { overflow: "hidden" },
  infoContainer: { flexDirection: "row", marginBottom: 12, gap: 12 },
  infoColumn: { flex: 1 },
  infoLabel: { fontWeight: "bold", fontSize: 13, color: "#1A1A1A" },
  infoText: { fontSize: 13, color: "#1A1A1A", marginBottom: 4 },
  totalBanner: {
    backgroundColor: "#f5c842",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalBannerText: {
    fontFamily: "Inter_700Bold",
    fontWeight: "bold",
    fontSize: 16,
    color: "#000000",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  summaryHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  summaryHeaderCell: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontWeight: "bold",
    fontSize: 11,
    color: "#FFEB00",
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
  summaryRowAlt: { backgroundColor: "#f5f5f5" },
  summaryCell: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#1A1A1A",
    textAlign: "center",
  },
  summaryDimCell: {
    textAlign: "left",
    fontFamily: "Inter_700Bold",
    fontWeight: "bold",
  },
  summaryCellGroup: {
    color: "#6a1b9a",
    fontFamily: "Inter_700Bold",
    fontWeight: "bold",
  },

  compositeBlock: { marginBottom: 16 },
  compHeader: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compHeaderText: {
    fontFamily: "Inter_700Bold",
    fontWeight: "bold",
    fontSize: 14,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  compCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 8,
    gap: 12,
  },
  legendItem: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#cccccc",
  },
  legendText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#1A1A1A" },
  dndPillsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dndPill: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999 },
  dndPillText: {
    fontFamily: "Inter_700Bold",
    fontWeight: "bold",
    fontSize: 11,
    color: "#FFFFFF",
  },
  dndLeans: {
    marginTop: 8,
    fontFamily: "Inter_700Bold",
    fontWeight: "bold",
    fontSize: 13,
    color: "#1A1A1A",
    textAlign: "center",
  },

  breakdownBlock: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  breakdownTitle: {
    fontFamily: "Inter_700Bold",
    fontWeight: "bold",
    fontSize: 14,
    color: "#1A1A1A",
    backgroundColor: "#f5c842",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  breakdownHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  breakdownHeaderText: {
    color: "#FFEB00",
    fontFamily: "Inter_700Bold",
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "center",
  },
  breakdownRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  breakdownRowAlt: { backgroundColor: "#f9f9f9" },
  breakdownAvgRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 8,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#c8e6c9",
  },
  breakdownCell: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#1A1A1A",
    textAlign: "center",
  },
  breakdownNameCell: {
    flex: 2,
    textAlign: "left",
    fontFamily: "Inter_500Medium",
  },
  breakdownAvgText: {
    fontFamily: "Inter_700Bold",
    fontWeight: "bold",
    color: "#2e7d32",
  },
});
