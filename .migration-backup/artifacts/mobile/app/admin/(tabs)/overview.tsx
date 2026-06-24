import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

import { useAdmin } from "@/context/AdminContext";
import { adminFetch } from "@/lib/api";

interface GenderBreakdown {
  skills: number;
  will: number;
  environmentalSupport: number;
  directiveNonDirective: number;
}

interface Stats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  averages: {
    skills: number;
    will: number;
    environmentalSupport: number;
    directiveNonDirective: number;
  };
  genderCharts: Record<string, GenderBreakdown>;
  genderCounts: Record<string, number>;
  scoreDistribution: Record<string, number>;
  timeline: { date: string; count: number }[];
}

const W = Dimensions.get("window").width;
const CHART_W = Math.min(W - 48, 480);

const CHART_CONFIG = {
  backgroundColor: "#18012C",
  backgroundGradientFrom: "#18012C",
  backgroundGradientTo: "#2D1156",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 235, 0, ${opacity})`,
  labelColor: () => "#D9CDE8",
  style: { borderRadius: 12 },
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#FFEB00" },
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function GenderBarChart({
  title,
  male,
  female,
}: {
  title: string;
  male: number;
  female: number;
}) {
  const maxW = CHART_W - 90;
  const maleW = Math.max((male / 100) * maxW, 4);
  const femaleW = Math.max((female / 100) * maxW, 4);
  return (
    <View style={styles.genderChart}>
      <Text style={styles.genderChartTitle}>{title}</Text>
      <View style={styles.genderRow}>
        <Text style={styles.genderLabel}>Male</Text>
        <View
          style={[
            styles.genderBar,
            { width: maleW, backgroundColor: "#1565c0" },
          ]}
        />
        <Text style={styles.genderPct}>{male.toFixed(1)}%</Text>
      </View>
      <View style={styles.genderRow}>
        <Text style={styles.genderLabel}>Female</Text>
        <View
          style={[
            styles.genderBar,
            { width: femaleW, backgroundColor: "#6a1b9a" },
          ]}
        />
        <Text style={styles.genderPct}>{female.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

export default function OverviewScreen() {
  const { token } = useAdmin();
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const data = await adminFetch<Stats>("/admin/stats", token);
      setStats(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    }
  }, [token]);

  React.useEffect(() => {
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

  if (error || !stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? "No data"}</Text>
      </View>
    );
  }

  const scoreLabels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const scoreData = scoreLabels.map((k) => stats.scoreDistribution[k] ?? 0);

  const timelineLast7 = stats.timeline.slice(-7);
  const timelineLabels = timelineLast7.map((d) => d.date.slice(5));
  const timelineData = timelineLast7.map((d) => d.count);

  const gc = stats.genderCharts ?? {};
  const male = gc["male"] ?? gc["Male"] ?? null;
  const female = gc["female"] ?? gc["Female"] ?? null;
  const hasGenderCharts = male !== null && female !== null;

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
      <Text style={styles.sectionTitle}>Summary</Text>
      <View style={styles.statRow}>
        <StatCard label="Total" value={stats.total} />
        <StatCard label="This Week" value={stats.thisWeek} />
        <StatCard label="This Month" value={stats.thisMonth} />
      </View>

      <Text style={styles.sectionTitle}>Average Scores</Text>
      <View style={styles.statRow}>
        <View style={styles.cardWrapper}>
          <StatCard label="Skills" value={`${stats.averages.skills}%`} />
        </View>
        <View style={styles.cardWrapper}>
          <StatCard label="Will" value={`${stats.averages.will}%`} />
        </View>
        <View style={styles.cardWrapper}>
          <StatCard
            label="Env Support"
            value={`${stats.averages.environmentalSupport}%`}
          />
        </View>
        <View style={styles.cardWrapper}>
          <StatCard
            label="D/Non-D"
            value={`${stats.averages.directiveNonDirective}%`}
          />
        </View>
      </View>

      {hasGenderCharts && (
        <>
          <Text style={styles.sectionTitle}>
            Gender Comparison by Composite
          </Text>
          <View style={styles.genderSection}>
            <GenderBarChart
              title="Skills"
              male={male!.skills}
              female={female!.skills}
            />
            <GenderBarChart
              title="Will"
              male={male!.will}
              female={female!.will}
            />
            <GenderBarChart
              title="Environmental Support"
              male={male!.environmentalSupport}
              female={female!.environmentalSupport}
            />
            <GenderBarChart
              title="Directive / Non-Directive"
              male={male!.directiveNonDirective}
              female={female!.directiveNonDirective}
            />
            <View style={styles.legend}>
              <View
                style={[styles.legendDot, { backgroundColor: "#1565c0" }]}
              />
              <Text style={styles.legendText}>Male</Text>
              <View
                style={[styles.legendDot, { backgroundColor: "#6a1b9a" }]}
              />
              <Text style={styles.legendText}>Female</Text>
            </View>
          </View>
        </>
      )}

      {scoreData.some((v) => v > 0) && (
        <>
          <Text style={styles.sectionTitle}>Score Distribution (1–10)</Text>
          <View style={styles.chartCard}>
            <BarChart
              data={{ labels: scoreLabels, datasets: [{ data: scoreData }] }}
              width={CHART_W}
              height={200}
              chartConfig={CHART_CONFIG}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
        </>
      )}

      {timelineData.length > 1 && (
        <>
          <Text style={styles.sectionTitle}>Submissions (Last 7 Days)</Text>
          <View style={styles.chartCard}>
            <LineChart
              data={{
                labels: timelineLabels,
                datasets: [{ data: timelineData.length ? timelineData : [0] }],
              }}
              width={CHART_W}
              height={180}
              chartConfig={CHART_CONFIG}
              style={styles.chart}
              bezier
              fromZero
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0E0020" },
  content: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E0020",
  },
  errorText: { color: "#D9CDE8", fontFamily: "Inter_500Medium", fontSize: 14 },
  sectionTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: "#FFEB00",
    marginTop: 20,
    marginBottom: 10,
  },
  statRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  statCard: {
    flex: 1,
    minWidth: 70,
    backgroundColor: "#18012C",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D1156",
  },
  cardWrapper: {
    width: "48%", // 2 cards per row
    marginBottom: 12,
  },

  statCard1: {
    flex: 1,
    minWidth: 70,
    backgroundColor: "#18012C",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D1156",
  },
  statValue: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 20,
    color: "#FFEB00",
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#D9CDE8",
    marginTop: 4,
    textAlign: "center",
  },
  genderSection: {
    backgroundColor: "#18012C",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D1156",
    gap: 16,
  },
  genderChart: { gap: 6 },
  genderChartTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#D9CDE8",
    marginBottom: 4,
  },
  genderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  genderLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#9B8EC4",
    width: 50,
  },
  genderBar: { height: 18, borderRadius: 4 },
  genderPct: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#FFEB00",
    marginLeft: 4,
  },
  legend: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#D9CDE8",
  },
  chartCard: {
    backgroundColor: "#18012C",
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#2D1156",
    alignItems: "center",
  },
  chart: { borderRadius: 8 },
});
