import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

import { useAdmin } from "@/context/AdminContext";
import { adminFetch } from "@/lib/api";

interface DataPoint {
  name: string;
  skills: number;
  will: number;
  env: number;
  submittedAt: string;
}

const W = Dimensions.get("window").width;
const CHART_W = Math.min(W - 32, 500);

const CHART_CONFIG = {
  backgroundColor: "#18012C",
  backgroundGradientFrom: "#18012C",
  backgroundGradientTo: "#2D1156",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(245, 200, 66, ${opacity})`,
  labelColor: () => "#D9CDE8",
  style: { borderRadius: 12 },
  propsForDots: { r: "5", strokeWidth: "2", stroke: "#f5c842" },
  fillShadowGradient: "#f5c842",
  fillShadowGradientOpacity: 0.3,
};

function DotPlot({
  data,
  xKey,
  yKey,
  xLabel,
  yLabel,
  dotColor,
}: {
  data: DataPoint[];
  xKey: keyof DataPoint;
  yKey: keyof DataPoint;
  xLabel: string;
  yLabel: string;
  dotColor: string;
}) {
  const size = Math.min(CHART_W, 340);
  const padding = 44;
  const plotW = size - padding * 2;
  const plotH = 200;

  return (
    <View style={styles.dotPlotContainer}>
      <View
        style={[
          styles.dotPlotArea,
          { width: size, height: plotH + padding },
        ]}
      >
        {/* Y Axis Title INSIDE chart */}
        <Text
          style={{
            position: "absolute",
            top: 2,
            left: padding,
            fontFamily: "Inter_500Medium",
            fontSize: 11,
            color: "#D9CDE8",
          }}
        >
          {yLabel}
        </Text>

        {/* Horizontal grid lines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <View
            key={`hg-${v}`}
            style={[
              styles.gridLine,
              { bottom: padding + (v / 100) * plotH },
            ]}
          />
        ))}

        {/* Y axis labels */}
        {[0, 50, 100].map((v) => (
          <Text
            key={`yl-${v}`}
            style={[
              styles.axisLabelY,
              {
                bottom: padding + (v / 100) * plotH - 6,
                left: 0,
              },
            ]}
          >
            {v}%
          </Text>
        ))}

        {/* Dots */}
        {data.map((d, i) => {
          const x = padding + ((d[xKey] as number) / 100) * plotW;
          const y = plotH - ((d[yKey] as number) / 100) * plotH;

          return (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  left: x - 5,
                  top: y,
                  backgroundColor: dotColor,
                },
              ]}
            />
          );
        })}

        {/* X axis labels */}
        {[0, 50, 100].map((v) => (
          <Text
            key={`xl-${v}`}
            style={[
              styles.axisLabel,
              {
                left: padding + (v / 100) * plotW - 10,
                bottom: 0,
              },
            ]}
          >
            {v}%
          </Text>
        ))}
      </View>

      {/* X Axis Title */}
      <Text style={styles.dotPlotAxisX}>{xLabel}</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { token } = useAdmin();

  const [points, setPoints] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await adminFetch<{ points?: DataPoint[] }>(
        "/admin/analytics",
        token
      );

      setPoints(Array.isArray(data.points) ? data.points : []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);

    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);

    await load();

    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FFEB00" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (points.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          No data yet. Submit some assessments first.
        </Text>
      </View>
    );
  }

  const byDate: Record<string, number> = {};

  for (const p of points) {
    const d = new Date(p.submittedAt).toISOString().slice(0, 10);

    byDate[d] = (byDate[d] ?? 0) + 1;
  }

  const timelineDates = Object.keys(byDate).sort().slice(-10);

  const timelineLabels = timelineDates.map((d) => d.slice(5));

  const timelineCounts = timelineDates.map((d) => byDate[d]!);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFEB00"
        />
      }
    >
      <Text style={styles.sectionTitle}>Skills vs Will</Text>

      <Text style={styles.sectionSub}>
        Each dot = one candidate
      </Text>

      <View style={styles.chartCard}>
        <DotPlot
          data={points}
          xKey="skills"
          yKey="will"
          xLabel="Skills %"
          yLabel="Will %"
          dotColor="#2e7d32"
        />
      </View>

      <Text style={styles.sectionTitle}>
        Will vs Environmental Support
      </Text>

      <Text style={styles.sectionSub}>
        Each dot = one candidate
      </Text>

      <View style={styles.chartCard}>
        <DotPlot
          data={points}
          xKey="will"
          yKey="env"
          xLabel="Will %"
          yLabel="Env Support %"
          dotColor="#e65100"
        />
      </View>

      {timelineCounts.length > 1 && (
        <>
          <Text style={styles.sectionTitle}>
            Submissions Over Time
          </Text>

          <View style={styles.chartCard}>
            <LineChart
              data={{
                labels: timelineLabels,
                datasets: [{ data: timelineCounts }],
              }}
              width={CHART_W}
              height={200}
              chartConfig={CHART_CONFIG}
              style={{ borderRadius: 8 }}
              bezier
              fromZero
            />
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Score Summary</Text>

      <View style={styles.summaryGrid}>
        {[
          {
            label: "Avg Skills",
            value:
              (
                points.reduce(
                  (a, p) => a + (p.skills ?? 0),
                  0
                ) / points.length
              ).toFixed(1) + "%",
          },
          {
            label: "Avg Will",
            value:
              (
                points.reduce(
                  (a, p) => a + (p.will ?? 0),
                  0
                ) / points.length
              ).toFixed(1) + "%",
          },
          {
            label: "Avg Env",
            value:
              (
                points.reduce(
                  (a, p) => a + (p.env ?? 0),
                  0
                ) / points.length
              ).toFixed(1) + "%",
          },
          {
            label: "Candidates",
            value: points.length,
          },
        ].map((item) => (
          <View
            key={item.label}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryValue}>
              {item.value}
            </Text>

            <Text style={styles.summaryLabel}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0E0020",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E0020",
  },

  errorText: {
    color: "#D9CDE8",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },

  emptyText: {
    color: "#9B8EC4",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
  },

  sectionTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: "#FFEB00",
    marginTop: 20,
    marginBottom: 4,
  },

  sectionSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#9B8EC4",
    marginBottom: 10,
  },

  chartCard: {
    backgroundColor: "#18012C",
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#2D1156",
    alignItems: "center",
  },

  dotPlotContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },

  dotPlotArea: {
    position: "relative",
  },

  dotPlotAxisX: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#D9CDE8",
    marginTop: 4,
  },

  gridLine: {
    position: "absolute",
    left: 44,
    right: 8,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.85,
  },

  axisLabel: {
    position: "absolute",
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "#9B8EC4",
  },

  axisLabelY: {
    position: "absolute",
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "#9B8EC4",
    width: 30,
    textAlign: "right",
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },

  summaryCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: "#18012C",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D1156",
  },

  summaryValue: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 22,
    color: "#FFEB00",
  },

  summaryLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#D9CDE8",
    marginTop: 4,
    textAlign: "center",
  },
});