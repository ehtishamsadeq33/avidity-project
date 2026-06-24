import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { useAdmin } from "@/context/AdminContext";
import { adminFetch, API_BASE } from "@/lib/api";
import { downloadPdfBase64 } from "@/lib/pdf";

interface CompositeBlock {
  percent?: number;
  knowledge?: number;
  behavior?: number;
  skill?: number;
  motivation?: number;
  belief?: number;
  confidence?: number;
  commitment?: number;
  leadership?: number;
  organization?: number;
  people?: number;
}

interface SubmissionPhase {
  phaseType: string;
  submittedAt: string;
  candidateInfo: {
    name?: string;
    gender?: string;
    age?: string;
    yearsInOrganization?: string;
    yearsInPosition?: string;
  };
  perceivedActual: {
    whatTheyThinkPercent?: number;
    whereTheyArePercent?: number;
  };
  composites: {
    skills?: CompositeBlock;
    will?: CompositeBlock;
    environmentalSupport?: CompositeBlock;
    directiveNonDirective?: CompositeBlock;
  };
  scores: Record<string, number>;
}

interface CompareData {
  phases: SubmissionPhase[];
  candidateName: string;
}

function formatDate(s: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function pct(v: number | undefined | null) {
  if (v == null) return "—";
  return `${Math.round(Number(v))}%`;
}

function delta(a: number | undefined | null, b: number | undefined | null) {
  if (a == null || b == null) return null;

  // avoid divide-by-zero
  if (Number(a) === 0) return null;

  return Math.round(((Number(b) - Number(a)) / Number(a)) * 100);
}

const PRE_COLOR = "#4ADE80";
const PRE_BG = "#0D2E1A";
const PRE_BORDER = "#166534";
const POST_COLOR = "#818CF8";
const POST_BG = "#1A1635";
const POST_BORDER = "#3730A3";

function phaseColor(pt: string) {
  return pt === "pre" ? PRE_COLOR : POST_COLOR;
}
function phaseBg(pt: string) {
  return pt === "pre" ? PRE_BG : POST_BG;
}
function phaseBorder(pt: string) {
  return pt === "pre" ? PRE_BORDER : POST_BORDER;
}

function DeltaChip({ d }: { d: number | null }) {
  if (d === null) return <Text style={styles.deltaNA}>—</Text>;
  const color = d > 0 ? "#4ADE80" : d < 0 ? "#F87171" : "#9B8EC4";
  const label = d > 0 ? `▲ +${d}%` : d < 0 ? `▼ ${d}%` : "→ 0%";
  return <Text style={[styles.deltaChip, { color }]}>{label}</Text>;
}

function CompositeRow({
  label,
  a,
  b,
  aColor,
  bColor,
  indent = false,
}: {
  label: string;
  a: number | undefined | null;
  b: number | undefined | null;
  aColor: string;
  bColor: string;
  indent?: boolean;
}) {
  const d = delta(a, b);
  return (
    <View style={[styles.compRow, indent && styles.compRowIndent]}>
      <Text style={[styles.compLabel, indent && styles.compLabelSub]}>
        {label}
      </Text>
      <View
        style={[
          styles.compPill,
          { backgroundColor: aColor + "33", borderColor: aColor },
        ]}
      >
        <Text style={[styles.compPillText, { color: aColor }]}>{pct(a)}</Text>
      </View>
      <View
        style={[
          styles.compPill,
          { backgroundColor: bColor + "33", borderColor: bColor },
        ]}
      >
        <Text style={[styles.compPillText, { color: bColor }]}>{pct(b)}</Text>
      </View>
      <View style={styles.compDelta}>
        <DeltaChip d={d} />
      </View>
    </View>
  );
}

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
      <Text style={[styles.sectionHeaderText, { color }]}>{title}</Text>
    </View>
  );
}

export default function CompareReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    preId: string;
    postId: string;
    groupId?: string;
  }>();
  const { token } = useAdmin();
  const [downloading, setDownloading] = useState(false);

  const compareQuery = useQuery({
    queryKey: ["compare-report", params.preId, params.postId],
    queryFn: () =>
      adminFetch<CompareData>(
        `/admin/report/compare?preSubmissionId=${params.preId}&postSubmissionId=${params.postId}`,
        token,
      ),
    enabled: !!params.preId && !!params.postId,
  });

  const handleDownloadPDF = async () => {
    if (!compareQuery.data) return;
    setDownloading(true);
    try {
      const resp = await fetch(`${API_BASE}/pdf/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phases: compareQuery.data.phases,
          candidateName: compareQuery.data.candidateName,
        }),
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(
          (json as { error?: string }).error ||
            `PDF download failed (${resp.status})`,
        );
      }
      if (!json.pdf) throw new Error("No PDF returned");
      const name = `CRA_Compare_${compareQuery.data.candidateName.replace(/\s+/g, "_") || "report"}.pdf`;
      await downloadPdfBase64(json.pdf, name);
    } catch (e) {
      console.error("PDF download failed", e);
    } finally {
      setDownloading(false);
    }
  };

  if (compareQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FFEB00" size="large" />
        <Text style={styles.loadingText}>Loading comparison…</Text>
      </View>
    );
  }

  if (compareQuery.error || !compareQuery.data) {
    return (
      <View style={styles.center}>
        <Feather name="alert-circle" size={32} color="#F87171" />
        <Text style={styles.errorText}>Failed to load comparison data</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { phases, candidateName } = compareQuery.data;
  const [phaseA, phaseB] = phases;
  const aColor = phaseColor(phaseA.phaseType);
  const bColor = phaseColor(phaseB.phaseType);
  const aLabel = phaseA.phaseType.toUpperCase();
  const bLabel = phaseB.phaseType.toUpperCase();

  const aSkills = phaseA.composites.skills?.percent;
  const bSkills = phaseB.composites.skills?.percent;
  const aWill = phaseA.composites.will?.percent;
  const bWill = phaseB.composites.will?.percent;
  const aEnv = phaseA.composites.environmentalSupport?.percent;
  const bEnv = phaseB.composites.environmentalSupport?.percent;
  const aDn = phaseA.composites.directiveNonDirective?.percent;
  const bDn = phaseB.composites.directiveNonDirective?.percent;

  const aCRA =
    aSkills != null && aWill != null && aEnv != null
      ? Math.round(
          ((Number(aSkills) * 1.3 +
            Number(aWill) * 1.45 +
            Number(aEnv) * 1.25) /
            4) *
            10,
        ) / 10
      : null;
  const bCRA =
    bSkills != null && bWill != null && bEnv != null
      ? Math.round(
          ((Number(bSkills) * 1.3 +
            Number(bWill) * 1.45 +
            Number(bEnv) * 1.25) /
            4) *
            10,
        ) / 10
      : null;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1E0A38" />
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={20} color="#FFEB00" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {aLabel} vs {bLabel} Comparison
        </Text>
        <TouchableOpacity
          onPress={handleDownloadPDF}
          disabled={downloading}
          style={styles.pdfBtn}
        >
          {downloading ? (
            <ActivityIndicator size="small" color="#0D0022" />
          ) : (
            <>
              <Feather name="download" size={13} color="#0D0022" />
              <Text style={styles.pdfBtnText}>PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Candidate info */}
        <View style={styles.card}>
          <Text style={styles.candidateName}>{candidateName || "—"}</Text>
          <View style={styles.phaseHeaderRow}>
            <View
              style={[
                styles.phaseTag,
                {
                  backgroundColor: phaseBg(phaseA.phaseType),
                  borderColor: phaseBorder(phaseA.phaseType),
                },
              ]}
            >
              <Text style={[styles.phaseTagText, { color: aColor }]}>
                {aLabel}
              </Text>
              <Text style={styles.phaseDate}>
                {formatDate(phaseA.submittedAt)}
              </Text>
            </View>
            <Feather name="arrow-right" size={16} color="#6B6480" />
            <View
              style={[
                styles.phaseTag,
                {
                  backgroundColor: phaseBg(phaseB.phaseType),
                  borderColor: phaseBorder(phaseB.phaseType),
                },
              ]}
            >
              <Text style={[styles.phaseTagText, { color: bColor }]}>
                {bLabel}
              </Text>
              <Text style={styles.phaseDate}>
                {formatDate(phaseB.submittedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Column headers */}
        <View style={styles.colHeaderRow}>
          <Text style={styles.colHeaderLabel}>Composite</Text>
          <Text style={[styles.colHeaderVal, { color: aColor }]}>{aLabel}</Text>
          <Text style={[styles.colHeaderVal, { color: bColor }]}>{bLabel}</Text>
          <Text style={styles.colHeaderDelta}>Change</Text>
        </View>

        {/* Composite CRA */}
        <View style={styles.card}>
          <SectionHeader title="Composite CRA Score" color="#FFEB00" />
          <CompositeRow
            label="Composite CRA"
            a={aCRA}
            b={bCRA}
            aColor={aColor}
            bColor={bColor}
          />
        </View>

        {/* Skills */}
        <View style={styles.card}>
          <SectionHeader title="Skills" color="#4ADE80" />
          <CompositeRow
            label="Skills"
            a={aSkills}
            b={bSkills}
            aColor={aColor}
            bColor={bColor}
          />
          <CompositeRow
            label="Knowledge"
            a={
              phaseA.composites.skills?.knowledge != null
                ? phaseA.composites.skills.knowledge * 10
                : undefined
            }
            b={
              phaseB.composites.skills?.knowledge != null
                ? phaseB.composites.skills.knowledge * 10
                : undefined
            }
            aColor={aColor}
            bColor={bColor}
            indent
          />
          <CompositeRow
            label="Behavior"
            a={
              phaseA.composites.skills?.behavior != null
                ? phaseA.composites.skills.behavior * 10
                : undefined
            }
            b={
              phaseB.composites.skills?.behavior != null
                ? phaseB.composites.skills.behavior * 10
                : undefined
            }
            aColor={aColor}
            bColor={bColor}
            indent
          />
          <CompositeRow
            label="Skill"
            a={
              phaseA.composites.skills?.skill != null
                ? phaseA.composites.skills.skill * 10
                : undefined
            }
            b={
              phaseB.composites.skills?.skill != null
                ? phaseB.composites.skills.skill * 10
                : undefined
            }
            aColor={aColor}
            bColor={bColor}
            indent
          />
        </View>

        {/* Will */}
        <View style={styles.card}>
          <SectionHeader title="Will" color="#FBBF24" />
          <CompositeRow
            label="Will"
            a={aWill}
            b={bWill}
            aColor={aColor}
            bColor={bColor}
          />
          <CompositeRow
            label="Motivation"
            a={
              phaseA.composites.will?.motivation != null
                ? phaseA.composites.will.motivation * 10
                : undefined
            }
            b={
              phaseB.composites.will?.motivation != null
                ? phaseB.composites.will.motivation * 10
                : undefined
            }
            aColor={aColor}
            bColor={bColor}
            indent
          />
          <CompositeRow
            label="Belief"
            a={
              phaseA.composites.will?.belief != null
                ? phaseA.composites.will.belief * 10
                : undefined
            }
            b={
              phaseB.composites.will?.belief != null
                ? phaseB.composites.will.belief * 10
                : undefined
            }
            aColor={aColor}
            bColor={bColor}
            indent
          />
          <CompositeRow
            label="Confidence"
            a={
              phaseA.composites.will?.confidence != null
                ? phaseA.composites.will.confidence * 10
                : undefined
            }
            b={
              phaseB.composites.will?.confidence != null
                ? phaseB.composites.will.confidence * 10
                : undefined
            }
            aColor={aColor}
            bColor={bColor}
            indent
          />
          <CompositeRow
            label="Commitment"
            a={
              phaseA.composites.will?.commitment != null
                ? phaseA.composites.will.commitment * 10
                : undefined
            }
            b={
              phaseB.composites.will?.commitment != null
                ? phaseB.composites.will.commitment * 10
                : undefined
            }
            aColor={aColor}
            bColor={bColor}
            indent
          />
        </View>

        {/* Environmental Support */}
        <View style={styles.card}>
          <SectionHeader title="Environmental Support" color="#C084FC" />
          <CompositeRow
            label="Env. Support"
            a={aEnv}
            b={bEnv}
            aColor={aColor}
            bColor={bColor}
          />
          <CompositeRow
            label="Leadership"
            a={
              phaseA.composites.environmentalSupport?.leadership != null
                ? phaseA.composites.environmentalSupport.leadership * 10
                : undefined
            }
            b={
              phaseB.composites.environmentalSupport?.leadership != null
                ? phaseB.composites.environmentalSupport.leadership * 10
                : undefined
            }
            aColor={aColor}
            bColor={bColor}
            indent
          />
          <CompositeRow
            label="Organization"
            a={
              phaseA.composites.environmentalSupport?.organization != null
                ? phaseA.composites.environmentalSupport.organization * 10
                : undefined
            }
            b={
              phaseB.composites.environmentalSupport?.organization != null
                ? phaseB.composites.environmentalSupport.organization * 10
                : undefined
            }
            aColor={aColor}
            bColor={bColor}
            indent
          />
          <CompositeRow
            label="People"
            a={
              phaseA.composites.environmentalSupport?.people != null
                ? phaseA.composites.environmentalSupport.people * 10
                : undefined
            }
            b={
              phaseB.composites.environmentalSupport?.people != null
                ? phaseB.composites.environmentalSupport.people * 10
                : undefined
            }
            aColor={aColor}
            bColor={bColor}
            indent
          />
        </View>

        {/* Directive / Non-Directive */}
        <View style={styles.card}>
          <SectionHeader title="Directive / Non-Directive" color="#60A5FA" />
          <CompositeRow
            label="Directive / Non-Directive"
            a={aDn}
            b={bDn}
            aColor={aColor}
            bColor={bColor}
          />
        </View>

        {/* Perceived vs Actual */}
        <View style={styles.card}>
          <SectionHeader title="Perceived vs Actual" color="#94A3B8" />
          <CompositeRow
            label="What They Think"
            a={phaseA.perceivedActual?.whatTheyThinkPercent}
            b={phaseB.perceivedActual?.whatTheyThinkPercent}
            aColor={aColor}
            bColor={bColor}
          />
          <CompositeRow
            label="Where They Are"
            a={phaseA.perceivedActual?.whereTheyArePercent}
            b={phaseB.perceivedActual?.whereTheyArePercent}
            aColor={aColor}
            bColor={bColor}
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0022" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D0022",
    gap: 12,
  },
  loadingText: {
    color: "#9B8EC4",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  errorText: { color: "#F87171", fontFamily: "Inter_500Medium", fontSize: 14 },
  backBtn: {
    backgroundColor: "#FFEB00",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#000" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#1E0A38",
    borderBottomWidth: 1,
    borderBottomColor: "#2D1156",
    gap: 10,
  },
  topBarTitle: {
    flex: 1,
    fontFamily: "Montserrat_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  pdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFEB00",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pdfBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#0D0022",
  },

  content: { padding: 16 },

  card: {
    backgroundColor: "#1E0A38",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D1156",
  },

  candidateName: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  phaseHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  phaseTag: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  phaseTagText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 1,
  },
  phaseDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#9B8EC4",
    marginTop: 3,
  },

  colHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  colHeaderLabel: {
    flex: 2,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#6B6480",
  },
  colHeaderVal: {
    width: 58,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    textAlign: "center",
  },
  colHeaderDelta: {
    width: 50,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#6B6480",
    textAlign: "center",
  },

  sectionHeader: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 0.3,
  },

  compRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  compRowIndent: {
    paddingLeft: 10,
  },
  compLabel: {
    flex: 2,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#D9CDE8",
  },
  compLabelSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#9B8EC4",
  },
  compPill: {
    width: 54,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 3,
    alignItems: "center",
    marginHorizontal: 2,
  },
  compPillText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  compDelta: {
    width: 50,
    alignItems: "center",
  },
  deltaChip: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  deltaNA: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#6B6480",
  },
});
