import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Path, Text as SvgText } from "react-native-svg";

const SCORE_COLORS: Record<string, string> = {
  "1": "#e8e83a",
  "2": "#c8d439",
  "3": "#8fbc3b",
  "4": "#4da63e",
  "5": "#2e8b44",
  "6": "#a0522d",
  "7": "#c65b22",
  "8": "#e07000",
  "9": "#d44000",
  "10": "#b22222",
};

const SCORE_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const SVG_SIZE = 460;
const CENTER = 230;
const PIE_RADIUS = 120;
const PIE_VISIBLE_SIZE = 450;

type Slice = {
  score: string;
  count: number;
  percent: number;
  color: string;
  label: string;
};

type Arc = Slice & {
  path: string;
  mid: number;
  inside: boolean;
  insidePos: { x: number; y: number };
};

type OutsideLabel = {
  score: string;
  percent: number;
  side: "left" | "right";
  y: number;
  line: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
  };
};

export type CandidateInfo = {
  name?: string;
  gender?: string;
  age?: string;
  yearsInOrganization?: string;
  yearsInPosition?: string;
};

export type PerceivedActual = {
  whatTheyThinkTotal?: number;
  whatTheyThinkPercent?: number;
  whereTheyAreTotal?: number;
  whereTheyArePercent?: number;
};

export type CompositeBlock = {
  total?: number;
  percent?: number;
  [k: string]: number | undefined;
};

export type Composites = {
  skills?: CompositeBlock;
  will?: CompositeBlock;
  environmentalSupport?: CompositeBlock;
  directiveNonDirective?: CompositeBlock;
};

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function describeSlice(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
) {
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const largeArc = end - start > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y} Z`;
}

function isDark(hex: string) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 160;
}

function clampPct(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

type GroupAverages = {
  groupSkills: number | null;
  groupWill: number | null;
  groupEnvironmentalSupport: number | null;
};

type Props = {
  candidateInfo: CandidateInfo;
  perceivedActual: PerceivedActual;
  composites: Composites;
  scores: Record<string, number>;
  totalResponses: number;
  interactive?: boolean;
  groupAverages?: GroupAverages | null;
};

export default function ReportPage1Content({
  candidateInfo,
  perceivedActual,
  composites,
  scores,
  totalResponses,
  interactive = true,
  groupAverages,
}: Props) {
  const [selectedScore, setSelectedScore] = useState<string | null>(null);

  const slices: Slice[] = useMemo(() => {
    return SCORE_KEYS.filter((k) => (scores[k] ?? 0) > 0)
      .map((k) => {
        const count = scores[k] ?? 0;
        const percent =
          totalResponses > 0
            ? Math.round((count / totalResponses) * 10000) / 100
            : 0;
        return {
          score: k,
          count,
          percent,
          color: SCORE_COLORS[k] ?? "#999999",
          label: `Score ${k}: ${percent}%`,
        };
      })
      .filter((s) => s.count > 0);
  }, [scores, totalResponses]);

  const arcs = useMemo<Arc[]>(() => {
    let start = -Math.PI / 2;
    return slices.map((slice) => {
      const sweep = (slice.percent / 100) * Math.PI * 2;
      const end = start + sweep;
      const mid = start + sweep / 2;
      const path = describeSlice(CENTER, CENTER, PIE_RADIUS, start, end);
      const insidePos = polarToCartesian(
        CENTER,
        CENTER,
        PIE_RADIUS * 0.65,
        mid,
      );
      const item = {
        ...slice,
        path,
        mid,
        inside: slice.percent >= 8,
        insidePos,
      };
      start = end;
      return item;
    });
  }, [slices]);

  const outsideLabels = useMemo(() => {
    const right: OutsideLabel[] = [];
    const left: OutsideLabel[] = [];

    for (const a of arcs) {
      if (a.inside) continue;
      const angle = ((a.mid % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const side: "left" | "right" =
        angle < Math.PI / 2 || angle > (Math.PI * 3) / 2 ? "right" : "left";
      const edge = polarToCartesian(CENTER, CENTER, PIE_RADIUS, a.mid);
      const bendRadius =
        a.score === "6" || a.score === "8" || a.score === "10" ? 120 : 155;
      const bendBase = polarToCartesian(CENTER, CENTER, bendRadius, a.mid);
      const labelX = side === "right" ? 335 : 85;
      const shiftedLabelX =
        a.score === "8"
          ? labelX + 18
          : a.score === "6" || a.score === "10"
            ? labelX + 25
            : labelX;
      const labelY = bendBase.y;
      const bendY = Math.max(labelY, CENTER - PIE_RADIUS - 20);
      const bend = { x: bendBase.x, y: bendY };
      const item: OutsideLabel = {
        score: a.score,
        percent: a.percent,
        side,
        y: labelY,
        line: {
          x1: edge.x,
          y1: edge.y,
          x2: bend.x,
          y2: bend.y,
          x3: side === "right" ? shiftedLabelX - 22 : shiftedLabelX + 22,
          y3: labelY,
        },
      };
      (side === "right" ? right : left).push(item);
    }

    const arrange = (items: OutsideLabel[]) => {
      items.sort((a, b) => a.y - b.y);
      const mid = Math.floor(items.length / 2);
      for (let i = mid + 1; i < items.length; i += 1) {
        if (items[i].y - items[i - 1].y < 26) items[i].y = items[i - 1].y + 26;
      }
      for (let i = mid - 1; i >= 0; i -= 1) {
        if (items[i + 1].y - items[i].y < 26) items[i].y = items[i + 1].y - 26;
      }
      items.forEach((item) => {
        if (item.y < 40) item.y = 40;
        if (item.y > 435) item.y = 435;
      });
      return items;
    };

    const fixCrossing = (items: OutsideLabel[]) => {
      for (let i = 0; i < items.length - 1; i += 1) {
        if (items[i].y > items[i + 1].y) {
          const temp = items[i].y;
          items[i].y = items[i + 1].y;
          items[i + 1].y = temp;
        }
      }
    };

    const leftArranged = arrange(left);
    const rightArranged = arrange(right);
    fixCrossing(leftArranged);
    fixCrossing(rightArranged);

    return [...leftArranged, ...rightArranged];
  }, [arcs]);

  const selected = slices.find((s) => s.score === selectedScore) ?? null;

  const skills = composites.skills ?? {};
  const will = composites.will ?? {};
  const env = composites.environmentalSupport ?? {};
  const skillsPct = Number(skills.percent ?? 0);
  const willPct = Number(will.percent ?? 0);
  const envPct = Number(env.percent ?? 0);
  const whatTheyThinkPct = Number(perceivedActual.whatTheyThinkPercent ?? 0);
  const whereTheyArePct = Number(perceivedActual.whereTheyArePercent ?? 0);

  return (
    <View>
      <View style={styles.candidateSection}>
        <View style={styles.candidateRow}>
          <View style={styles.candidateCol}>
            <View style={styles.candidateLine}>
              <Text style={styles.candidateLabel}>Name </Text>
              <Text style={styles.candidateColon}>: </Text>
              <Text style={styles.candidateValue}>
                {candidateInfo.name ?? "—"}
              </Text>
            </View>
            <View style={styles.candidateLine}>
              <Text style={styles.candidateLabel}>Gender </Text>
              <Text style={styles.candidateColon}>: </Text>
              <Text style={styles.candidateValue}>
                {candidateInfo.gender ?? "—"}
              </Text>
            </View>
            <View style={styles.candidateLine}>
              <Text style={styles.candidateLabel}>Age </Text>
              <Text style={styles.candidateColon}>: </Text>
              <Text style={styles.candidateValue}>
                {candidateInfo.age ?? "—"}
              </Text>
            </View>
          </View>
          <View style={styles.candidateCol}>
            <View style={styles.candidateLine}>
              <Text style={styles.candidateLabel}>Years in Organization </Text>
              <Text style={styles.candidateColon}>: </Text>
              <Text style={styles.candidateValue}>
                {candidateInfo.yearsInOrganization ?? "—"}
              </Text>
            </View>
            <View style={styles.candidateLine}>
              <Text style={styles.candidateLabel}>Years in Position </Text>
              <Text style={styles.candidateColon}>: </Text>
              <Text style={styles.candidateValue}>
                {candidateInfo.yearsInPosition ?? "—"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Candidate's Perceived and Actual Coaching Skills Score
        </Text>
        <View style={styles.paRow}>
          <View style={[styles.paCard, styles.paLight]}>
            <Text style={styles.paTitleDark}>What They Think</Text>
            <View style={styles.paBarTrackLight}>
              <View
                style={[
                  styles.paBarFillLight,
                  { width: `${clampPct(whatTheyThinkPct)}%` },
                ]}
              >
                <Text style={styles.paBarText} numberOfLines={1}>
                  {whatTheyThinkPct}%
                </Text>
              </View>
            </View>
            <View style={styles.paAxis}>
              <Text style={styles.paAxisText}>0%</Text>
              <Text style={styles.paAxisText}>100%</Text>
            </View>
          </View>

          <View style={[styles.paCard, styles.paDark]}>
            <Text style={styles.paTitleLight}>Where They Are</Text>
            <View style={styles.paBarTrackDark}>
              <View
                style={[
                  styles.paBarFillDark,
                  { width: `${clampPct(whereTheyArePct)}%` },
                ]}
              >
                <Text
                  style={[styles.paBarText, styles.paBarTextLight]}
                  numberOfLines={1}
                >
                  {whereTheyArePct}%
                </Text>
              </View>
            </View>
            <View style={styles.paAxis}>
              <Text style={[styles.paAxisText, styles.paAxisTextLight]}>
                0%
              </Text>
              <Text style={[styles.paAxisText, styles.paAxisTextLight]}>
                100%
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.card, styles.compositesCard]}>
        <View style={styles.compHeaderRow}>
          <Text style={styles.compHeaderText}>Composites</Text>
          <Text style={styles.compHeaderText}>Individual Results</Text>
          <Text style={styles.compHeaderText}>Group Results</Text>
        </View>
        <View style={styles.compRow}>
          <View style={[styles.compPill, { backgroundColor: "#4caf50" }]}>
            <Text style={styles.compPillText}>Skills</Text>
          </View>
          <View style={[styles.compPill, { backgroundColor: "#4caf50" }]}>
            <Text style={styles.compPillText}>{skillsPct}%</Text>
          </View>
          <View style={[styles.compPill, { backgroundColor: "#4caf50" }]}>
            <Text style={styles.compPillText}>
              {groupAverages?.groupSkills != null
                ? `${groupAverages.groupSkills.toFixed(1)}%`
                : "N/A"}
            </Text>
          </View>
        </View>
        <View style={styles.compRow}>
          <View style={[styles.compPill, { backgroundColor: "#ff9800" }]}>
            <Text style={styles.compPillText}>Will</Text>
          </View>
          <View style={[styles.compPill, { backgroundColor: "#ff9800" }]}>
            <Text style={styles.compPillText}>{willPct}%</Text>
          </View>
          <View style={[styles.compPill, { backgroundColor: "#ff9800" }]}>
            <Text style={styles.compPillText}>
              {groupAverages?.groupWill != null
                ? `${groupAverages.groupWill.toFixed(1)}%`
                : "N/A"}
            </Text>
          </View>
        </View>
        <View style={[styles.compRow, styles.compRowLast]}>
          <View style={[styles.compPill, { backgroundColor: "#9c27b0" }]}>
            <Text style={styles.compPillText}>Environmental Support</Text>
          </View>
          <View style={[styles.compPill, { backgroundColor: "#9c27b0" }]}>
            <Text style={styles.compPillText}>{envPct}%</Text>
          </View>
          <View style={[styles.compPill, { backgroundColor: "#9c27b0" }]}>
            <Text style={styles.compPillText}>
              {groupAverages?.groupEnvironmentalSupport != null
                ? `${groupAverages.groupEnvironmentalSupport.toFixed(1)}%`
                : "N/A"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Candidate's CRA Score Spread</Text>
        <View style={styles.body}>
          <View style={styles.leftBox}>
            <Text style={styles.leftHeader}>Score Spread</Text>
            <Text style={styles.leftText}>
              This chart shows the distribution of your responses across the
              1–10 scale, based on a total of{" "}
              <Text style={styles.leftStrong}>{totalResponses}</Text> statement
              responses. Each slice represents how often a particular score was
              selected.
            </Text>
          </View>
          <View style={styles.rightBox}>
            {arcs.length > 0 ? (
              <View collapsable={false} style={styles.chartWrap}>
                <Svg
                  width={PIE_VISIBLE_SIZE}
                  height={PIE_VISIBLE_SIZE}
                  viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                  style={styles.chartSvg}
                >
                  <G>
                    {arcs.length === 1
                      ? (() => {
                          const a = arcs[0];
                          const labelTextColor = isDark(a.color)
                            ? "#FFFFFF"
                            : "#1A1A1A";
                          const labelX = CENTER + PIE_RADIUS + 40;
                          const topY = CENTER - PIE_RADIUS;
                          return (
                            <G key={a.score}>
                              <Circle
                                cx={CENTER}
                                cy={CENTER}
                                r={PIE_RADIUS}
                                fill={a.color}
                                stroke="#ffffff"
                                strokeWidth={3}
                                onPress={
                                  interactive
                                    ? () =>
                                        setSelectedScore(
                                          selectedScore === a.score
                                            ? null
                                            : a.score,
                                        )
                                    : undefined
                                }
                              />
                              <SvgText
                                x={CENTER}
                                y={CENTER - 2}
                                fill={labelTextColor}
                                textAnchor="middle"
                                fontSize={16}
                                fontWeight="700"
                              >
                                {`Score ${a.score}`}
                              </SvgText>
                              <SvgText
                                x={CENTER}
                                y={CENTER + 16}
                                fill={labelTextColor}
                                textAnchor="middle"
                                fontSize={14}
                                fontWeight="700"
                              >
                                100%
                              </SvgText>
                              <Line
                                x1={CENTER}
                                y1={topY}
                                x2={CENTER}
                                y2={topY - 24}
                                stroke="#888888"
                                strokeWidth={0.8}
                              />
                              <Line
                                x1={CENTER}
                                y1={topY - 24}
                                x2={labelX - 22}
                                y2={topY - 24}
                                stroke="#888888"
                                strokeWidth={0.8}
                              />
                              <SvgText
                                x={labelX - 22}
                                y={topY - 26}
                                fill="#333333"
                                textAnchor="start"
                                fontSize={11}
                                fontWeight="700"
                              >
                                {`Score ${a.score}`}
                              </SvgText>
                              <SvgText
                                x={labelX - 22}
                                y={topY - 14}
                                fill="#555555"
                                textAnchor="start"
                                fontSize={10}
                              >
                                100%
                              </SvgText>
                            </G>
                          );
                        })()
                      : null}
                    {arcs.length > 1 &&
                      arcs.map((a) => {
                        const isSelected = selectedScore === a.score;
                        const labelTextColor = isDark(a.color)
                          ? "#FFFFFF"
                          : "#1A1A1A";
                        const outside = outsideLabels.find(
                          (l) => l.score === a.score,
                        );
                        const percentText = `${a.percent.toFixed(2)}%`;
                        return (
                          <G key={a.score}>
                            <Path
                              d={a.path}
                              fill={a.color}
                              stroke="#ffffff"
                              strokeWidth={isSelected ? 5 : 3}
                              opacity={selectedScore && !isSelected ? 0.95 : 1}
                              onPress={
                                interactive
                                  ? () =>
                                      setSelectedScore(
                                        isSelected ? null : a.score,
                                      )
                                  : undefined
                              }
                            />
                            {a.inside ? (
                              <G>
                                <SvgText
                                  x={a.insidePos.x}
                                  y={a.insidePos.y - 2}
                                  fill={labelTextColor}
                                  textAnchor="middle"
                                  fontSize={10}
                                  fontWeight="700"
                                >
                                  {a.percent >= 8
                                    ? `Score ${a.score}`
                                    : percentText}
                                </SvgText>
                                {a.percent >= 8 ? (
                                  <SvgText
                                    x={a.insidePos.x}
                                    y={a.insidePos.y + 10}
                                    fill={labelTextColor}
                                    textAnchor="middle"
                                    fontSize={10}
                                    fontWeight="700"
                                  >
                                    {percentText}
                                  </SvgText>
                                ) : null}
                              </G>
                            ) : null}
                            {!a.inside && outside ? (
                              <G>
                                <Line
                                  x1={outside.line.x1}
                                  y1={outside.line.y1}
                                  x2={outside.line.x2}
                                  y2={outside.line.y2}
                                  stroke="#888888"
                                  strokeWidth={0.8}
                                />
                                <Line
                                  x1={outside.line.x2}
                                  y1={outside.line.y2}
                                  x2={outside.line.x3}
                                  y2={outside.line.y3}
                                  stroke="#888888"
                                  strokeWidth={0.8}
                                />
                                <SvgText
                                  x={outside.line.x3}
                                  y={outside.y - 2}
                                  fill="#333333"
                                  textAnchor={
                                    outside.side === "right" ? "start" : "end"
                                  }
                                  fontSize={11}
                                  fontWeight="700"
                                >
                                  {`Score ${a.score}`}
                                </SvgText>
                                <SvgText
                                  x={outside.line.x3}
                                  y={outside.y + 10}
                                  fill="#555555"
                                  textAnchor={
                                    outside.side === "right" ? "start" : "end"
                                  }
                                  fontSize={10}
                                >
                                  {percentText}
                                </SvgText>
                              </G>
                            ) : null}
                          </G>
                        );
                      })}
                  </G>
                </Svg>
                <View style={styles.selectionBox}>
                  {selected ? (
                    <>
                      <View
                        style={[
                          styles.selectionSwatch,
                          { backgroundColor: selected.color },
                        ]}
                      />
                      <Text style={styles.selectionText}>
                        Score {selected.score}: {selected.percent}% (
                        {selected.count}{" "}
                        {selected.count === 1 ? "response" : "responses"})
                      </Text>
                    </>
                  ) : null}
                </View>
              </View>
            ) : (
              <Text style={styles.empty}>No responses to display.</Text>
            )}
            <View style={styles.legend}>
              {slices.map((s) => {
                const isSelected = selectedScore === s.score;
                return (
                  <Pressable
                    key={s.score}
                    onPress={
                      interactive
                        ? () => setSelectedScore(isSelected ? null : s.score)
                        : undefined
                    }
                    style={[
                      styles.legendItem,
                      isSelected && styles.legendItemActive,
                    ]}
                  >
                    <View
                      style={[styles.swatch, { backgroundColor: s.color }]}
                    />
                    <Text style={styles.legendText}>{s.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffde7",
    borderColor: "#f5c842",
    borderWidth: 2,
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
  },
  candidateSection: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginBottom: 12,
  },
  candidateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  candidateCol: {
    flex: 1,
    minWidth: 150,
  },
  candidateLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  candidateLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#1A1A1A",
  },
  candidateColon: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#1A1A1A",
  },
  candidateValue: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#1A1A1A",
    flexShrink: 1,
  },
  paRow: {
    flexDirection: "column",
    gap: 12,
  },
  paCard: {
    borderRadius: 10,
    padding: 14,
  },
  paLight: { backgroundColor: "#c8e6c9" },
  paDark: { backgroundColor: "#388e3c" },
  paTitleDark: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 10,
  },
  paTitleLight: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  paBarTrackLight: {
    height: 22,
    backgroundColor: "#e8f5e9",
    borderRadius: 11,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#a5d6a7",
  },
  paBarFillLight: {
    height: "100%",
    backgroundColor: "#66bb6a",
    borderRadius: 11,
    justifyContent: "center",
    paddingHorizontal: 8,
    minWidth: 36,
  },
  paBarTrackDark: {
    height: 22,
    backgroundColor: "#1f5b25",
    borderRadius: 11,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#0d3a13",
  },
  paBarFillDark: {
    height: "100%",
    backgroundColor: "#66bb6a",
    borderRadius: 11,
    justifyContent: "center",
    paddingHorizontal: 8,
    minWidth: 36,
  },
  paBarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#1A1A1A",
  },
  paBarTextLight: { color: "#FFFFFF" },
  paAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  paAxisText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#1A1A1A",
  },
  paAxisTextLight: { color: "#FFFFFF" },
  compositesCard: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  compHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5c842",
  },
  compHeaderText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#1A1A1A",
    flex: 1,
    textAlign: "center",
  },
  compRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5c842",
    gap: 10,
  },
  compRowLast: {
    borderBottomWidth: 0,
  },
  compPill: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  compPillGroup: {
    backgroundColor: "#1a237e",
  },
  compPillText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
    textAlign: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 18,
  },
  body: { flexDirection: "column", gap: 16, alignItems: "stretch" },
  leftBox: {
    backgroundColor: "#FFEB00",
    borderColor: "#000000",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  leftHeader: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  leftText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    color: "#1A1A1A",
  },
  leftStrong: { fontFamily: "Inter_700Bold" },
  rightBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0E6B8",
    alignItems: "center",
    alignSelf: "stretch",
  },
  chartWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 16,
  },
  chartSvg: { alignSelf: "center", overflow: "visible" },
  selectionBox: {
    marginTop: 12,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  selectionSwatch: { width: 14, height: 14, borderRadius: 3, marginRight: 8 },
  selectionText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#1A1A1A",
  },
  legendItemActive: {
    backgroundColor: "#FFEB00",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  empty: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#6B6480",
    textAlign: "center",
    paddingVertical: 24,
  },
  legend: { marginTop: 14 },
  legendItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#333333",
    marginLeft: 6,
  },
  swatch: { width: 12, height: 12, borderRadius: 2 },
});
