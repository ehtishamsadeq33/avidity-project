import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { useAdmin } from "@/context/AdminContext";
import { adminFetch } from "@/lib/api";

interface Phase {
  phaseType: "pre" | "post";
  code: string;
  enabled: boolean;
  createdAt: string;
}

interface Group {
  _id: string;
  groupName: string;
  organization: string;
  description: string;
  phases: Phase[];
  // Legacy fields
  groupCode?: string;
  cohort?: string;
  createdAt: string;
  createdBy: string;
}

interface Submission {
  _id: string;
  name: string;
  groupCode: string;
  phase: "pre" | "post" | null;
  submittedAt: string;
  composites: {
    skills?: { percent: number };
    will?: { percent: number };
    environmentalSupport?: { percent: number };
  };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function pct(v: number | undefined) {
  return typeof v === "number" ? `${Math.round(v)}%` : "—";
}

const PHASE_COLORS: Record<string, { text: string; bg: string; border: string; tab: string }> = {
  pre: { text: "#4ADE80", bg: "#0D2E1A", border: "#166534", tab: "#166534" },
  post: { text: "#818CF8", bg: "#1A1635", border: "#3730A3", tab: "#3730A3" },
};

export default function GroupDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { token } = useAdmin();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"pre" | "post" | "all">("pre");

  const groupQuery = useQuery({
    queryKey: ["admin-group", params.id],
    queryFn: () => adminFetch<{ group: Group }>(`/admin/groups/${params.id}`, token),
    enabled: !!params.id,
  });

  const submissionsQuery = useQuery({
    queryKey: ["admin-group-submissions", params.id, activeTab],
    queryFn: () => {
      const url =
        activeTab === "all"
          ? `/admin/groups/${params.id}/submissions`
          : `/admin/groups/${params.id}/submissions?phase=${activeTab}`;
      return adminFetch<{ submissions: Submission[]; group: Group }>(url, token);
    },
    enabled: !!params.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (responseId: string) =>
      adminFetch(`/admin/responses/${responseId}`, token, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-group-submissions", params.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
    },
  });

  const generatePostMutation = useMutation({
    mutationFn: () =>
      adminFetch(`/admin/groups/${params.id}/generate-post`, token, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-group", params.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      setActiveTab("post");
    },
  });

  const handleDelete = (sub: Submission) => {
    Alert.alert(
      "Remove Submission",
      `Remove submission from "${sub.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteMutation.mutate(sub._id),
        },
      ],
    );
  };

  const handleGeneratePost = () => {
    Alert.alert(
      "Generate POST Code",
      "Create a POST survey phase for this group? A new code will be generated automatically.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate",
          onPress: () => generatePostMutation.mutate(),
        },
      ],
    );
  };

  const group = groupQuery.data?.group;
  const submissions = submissionsQuery.data?.submissions ?? [];
  const isLegacy = !group?.phases || group.phases.length === 0;

  if (groupQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FFEB00" size="large" />
      </View>
    );
  }

  if (groupQuery.error || !group) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Group not found</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const prePhase = group.phases?.find((p) => p.phaseType === "pre");
  const postPhase = group.phases?.find((p) => p.phaseType === "post");

  const tabs: Array<{ key: "pre" | "post" | "all"; label: string }> = isLegacy
    ? [{ key: "all", label: "All Submissions" }]
    : [
        { key: "pre", label: "PRE" },
        { key: "post", label: "POST" },
        { key: "all", label: "All" },
      ];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.groupName}>{group.groupName}</Text>
          {group.organization ? (
            <Text style={styles.meta}>
              <Text style={styles.metaLabel}>Organization: </Text>
              {group.organization}
            </Text>
          ) : null}
          {group.description ? (
            <Text style={styles.meta}>
              <Text style={styles.metaLabel}>Description: </Text>
              {group.description}
            </Text>
          ) : null}
          <Text style={styles.meta}>
            <Text style={styles.metaLabel}>Created: </Text>
            {formatDate(group.createdAt)} by {group.createdBy}
          </Text>

          {/* Legacy group code */}
          {isLegacy && group.groupCode ? (
            <View style={styles.legacyCodeRow}>
              <Feather name="hash" size={14} color="#FFEB00" />
              <Text style={styles.legacyCodeText}>{group.groupCode}</Text>
              {group.cohort ? <Text style={styles.legacyCohort}>{group.cohort}</Text> : null}
            </View>
          ) : null}

          {/* Phase codes */}
          {!isLegacy ? (
            <View style={styles.phaseCodesBlock}>
              {group.phases.map((phase) => {
                const colors = PHASE_COLORS[phase.phaseType] ?? PHASE_COLORS.pre;
                return (
                  <View
                    key={phase.phaseType}
                    style={[styles.phaseCodeCard, { backgroundColor: colors.bg, borderColor: colors.border }]}
                  >
                    <View style={styles.phaseCodeLabelRow}>
                      <Text style={[styles.phaseCodeLabel, { color: colors.text }]}>
                        {phase.phaseType.toUpperCase()}
                      </Text>
                      {!phase.enabled && <Text style={styles.disabledTag}>DISABLED</Text>}
                    </View>
                    <Text style={[styles.phaseCodeValue, { color: colors.text }]}>
                      {phase.code}
                    </Text>
                  </View>
                );
              })}

              {!postPhase && (
                <TouchableOpacity
                  style={styles.generatePostBtn}
                  onPress={handleGeneratePost}
                  disabled={generatePostMutation.isPending}
                >
                  {generatePostMutation.isPending ? (
                    <ActivityIndicator size="small" color="#818CF8" />
                  ) : (
                    <>
                      <Feather name="plus" size={14} color="#818CF8" />
                      <Text style={styles.generatePostText}>Generate POST Code</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const colors = tab.key !== "all" ? PHASE_COLORS[tab.key] : null;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  isActive && styles.tabActive,
                  isActive && colors ? { borderBottomColor: colors.text } : null,
                  isActive && !colors ? { borderBottomColor: "#FFEB00" } : null,
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive && { color: colors ? colors.text : "#FFEB00" },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Active tab info */}
        {!isLegacy && activeTab !== "all" && (
          <View style={styles.phaseInfo}>
            {activeTab === "pre" && prePhase ? (
              <>
                <Text style={styles.phaseInfoText}>
                  Code:{" "}
                  <Text style={[styles.phaseInfoCode, { color: PHASE_COLORS.pre.text }]}>
                    {prePhase.code}
                  </Text>
                </Text>
                {!prePhase.enabled && (
                  <Text style={styles.phaseDisabledNote}>
                    This phase is currently disabled — candidates cannot use this code.
                  </Text>
                )}
              </>
            ) : null}
            {activeTab === "post" && postPhase ? (
              <>
                <Text style={styles.phaseInfoText}>
                  Code:{" "}
                  <Text style={[styles.phaseInfoCode, { color: PHASE_COLORS.post.text }]}>
                    {postPhase.code}
                  </Text>
                </Text>
                {!postPhase.enabled && (
                  <Text style={styles.phaseDisabledNote}>
                    This phase is currently disabled — candidates cannot use this code.
                  </Text>
                )}
              </>
            ) : null}
            {activeTab === "post" && !postPhase ? (
              <View style={styles.noPostBlock}>
                <Text style={styles.noPostText}>No POST phase yet.</Text>
                <TouchableOpacity
                  style={styles.generatePostBtnSmall}
                  onPress={handleGeneratePost}
                  disabled={generatePostMutation.isPending}
                >
                  {generatePostMutation.isPending ? (
                    <ActivityIndicator size="small" color="#818CF8" />
                  ) : (
                    <Text style={styles.generatePostText}>+ Generate POST Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}

        {/* Submission count header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {submissionsQuery.isLoading
              ? "Loading…"
              : `${submissions.length} ${submissions.length === 1 ? "Submission" : "Submissions"}`}
          </Text>
          {submissionsQuery.isLoading ? <ActivityIndicator color="#FFEB00" size="small" /> : null}
        </View>

        {/* Empty state */}
        {!submissionsQuery.isLoading && submissions.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Feather name="inbox" size={32} color="#6B6480" />
            <Text style={styles.emptyText}>
              {activeTab === "post" && !postPhase
                ? "Generate a POST code to start collecting POST submissions."
                : `No ${activeTab === "all" ? "" : activeTab.toUpperCase() + " "}submissions yet.`}
            </Text>
          </View>
        ) : null}

        {/* Submission rows */}
        {submissions.map((sub) => (
          <View key={sub._id} style={styles.subRow}>
            <View style={styles.subLeft}>
              <Feather name="check-circle" size={16} color="#4CAF50" />
              <View style={{ flex: 1 }}>
                <View style={styles.subNameRow}>
                  <Text style={styles.subName}>{sub.name}</Text>
                  {sub.phase && (
                    <Text
                      style={[
                        styles.phasePill,
                        {
                          color: PHASE_COLORS[sub.phase]?.text ?? "#9B8EC4",
                          backgroundColor: PHASE_COLORS[sub.phase]?.bg ?? "#2D1156",
                          borderColor: PHASE_COLORS[sub.phase]?.border ?? "#2D1156",
                        },
                      ]}
                    >
                      {sub.phase.toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text style={styles.subDate}>{formatDate(sub.submittedAt)}</Text>
              </View>
            </View>
            <View style={styles.subRight}>
              <View style={styles.scoreChips}>
                <Text style={styles.scoreChip}>S: {pct(sub.composites?.skills?.percent)}</Text>
                <Text style={styles.scoreChip}>W: {pct(sub.composites?.will?.percent)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(sub)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && deleteMutation.variables === sub._id ? (
                  <ActivityIndicator size="small" color="#D14343" />
                ) : (
                  <Feather name="trash-2" size={16} color="#D14343" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0022" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D0022" },
  errorText: { color: "#D14343", fontFamily: "Inter_500Medium", fontSize: 14, marginBottom: 12 },
  retryBtn: { backgroundColor: "#FFEB00", borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#000" },
  content: { padding: 16, paddingBottom: 60 },
  infoCard: {
    backgroundColor: "#1E0A38",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2D1156",
  },
  groupName: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  meta: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#9B8EC4",
    marginBottom: 3,
  },
  metaLabel: {
    fontFamily: "Inter_600SemiBold",
    color: "#D9CDE8",
  },
  legacyCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  legacyCodeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFEB00",
    letterSpacing: 3,
  },
  legacyCohort: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#FFEB00",
    backgroundColor: "#2D1156",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  phaseCodesBlock: {
    marginTop: 14,
    gap: 8,
  },
  phaseCodeCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  phaseCodeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  phaseCodeLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  disabledTag: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#D14343",
    backgroundColor: "#2D0A0A",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    letterSpacing: 0.5,
  },
  phaseCodeValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    letterSpacing: 2,
  },
  generatePostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#3730A3",
    borderRadius: 8,
    borderStyle: "dashed",
    paddingVertical: 10,
  },
  generatePostBtnSmall: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#3730A3",
    borderRadius: 8,
    marginTop: 10,
  },
  generatePostText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#818CF8",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#2D1156",
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {},
  tabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#6B6480",
  },
  phaseInfo: {
    backgroundColor: "#18012C",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  phaseInfoText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#9B8EC4",
  },
  phaseInfoCode: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  phaseDisabledNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#D14343",
    marginTop: 4,
  },
  noPostBlock: {
    alignItems: "flex-start",
  },
  noPostText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#9B8EC4",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#D9CDE8",
  },
  emptyBlock: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#6B6480",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E0A38",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2D1156",
  },
  subLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  subNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  subName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  phasePill: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    letterSpacing: 0.5,
  },
  subDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#9B8EC4",
    marginTop: 2,
  },
  subRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  scoreChips: { flexDirection: "row", gap: 6 },
  scoreChip: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#FFEB00",
    backgroundColor: "#2D1156",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
