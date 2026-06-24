import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { adminFetch, API_BASE } from "@/lib/api";
import { downloadPdfBase64 } from "@/lib/pdf";

// Same fields the candidates tab fetches for the report page
interface Candidate {
  _id: string;
  submittedAt: string;
  totalResponses?: number;
  scores?: Record<string, number>;
  candidateInfo: {
    name: string;
    gender: string;
    age: string;
    yearsInOrganization?: string;
    yearsInPosition?: string;
  };
  perceivedActual: {
    whatTheyThinkTotal?: number;
    whatTheyThinkPercent?: number;
    whereTheyAreTotal?: number;
    whereTheyArePercent?: number;
  };
  composites: {
    skills: { percent: number; total?: number };
    will: { percent: number; total?: number };
    environmentalSupport: { percent: number; total?: number };
    directiveNonDirective?: { percent: number; total?: number };
  };
  groupId?: string | null;
}

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
  icNumber?: string;
  composites: {
    skills?: { percent: number };
    will?: { percent: number };
    environmentalSupport?: { percent: number };
  };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function pct(v: number | undefined) {
  return typeof v === "number" ? `${Math.round(v)}%` : "—";
}

const PHASE_COLORS: Record<
  string,
  { text: string; bg: string; border: string; tab: string }
> = {
  pre: { text: "#4ADE80", bg: "#0D2E1A", border: "#166534", tab: "#166534" },
  post: { text: "#818CF8", bg: "#1A1635", border: "#3730A3", tab: "#3730A3" },
};

// ── Compare Modal ─────────────────────────────────────────────────────────────

interface CompareModalProps {
  visible: boolean;
  onClose: () => void;
  preSubmissions: Submission[];
  postSubmissions: Submission[];
  groupId: string;
  onNavigate: (preId: string, postId: string) => void;
}

function CompareModal({
  visible,
  onClose,
  preSubmissions,
  postSubmissions,
  groupId,
  onNavigate,
}: CompareModalProps) {
  const [selectedPre, setSelectedPre] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [step, setStep] = useState<"pre" | "post">("pre");

  const handleReset = () => {
    setSelectedPre(null);
    setSelectedPost(null);
    setStep("pre");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleGenerate = () => {
    if (!selectedPre || !selectedPost) return;
    handleClose();
    onNavigate(selectedPre, selectedPost);
  };

  const renderSubmissionOption = (
    sub: Submission,
    isSelected: boolean,
    onSelect: () => void,
  ) => (
    <TouchableOpacity
      key={sub._id}
      style={[styles.subOption, isSelected && styles.subOptionSelected]}
      onPress={onSelect}
    >
      <View style={styles.subOptionLeft}>
        <View
          style={[
            styles.subOptionRadio,
            isSelected && styles.subOptionRadioSelected,
          ]}
        >
          {isSelected && <View style={styles.subOptionRadioDot} />}
        </View>
        <View>
          <Text style={styles.subOptionName}>{sub.name || "—"}</Text>
          <Text style={styles.subOptionMeta}>
            {formatDate(sub.submittedAt)}
            {sub.icNumber ? ` · IC: ${sub.icNumber}` : ""}
          </Text>
        </View>
      </View>
      <View style={styles.subOptionScores}>
        <Text style={styles.subOptionScore}>
          S: {pct(sub.composites?.skills?.percent)}
        </Text>
        <Text style={styles.subOptionScore}>
          W: {pct(sub.composites?.will?.percent)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const canGenerate = !!selectedPre && !!selectedPost;
  const preLabel = selectedPre
    ? preSubmissions.find((s) => s._id === selectedPre)?.name
    : null;
  const postLabel = selectedPost
    ? postSubmissions.find((s) => s._id === selectedPost)?.name
    : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Compare PRE vs POST</Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={20} color="#9B8EC4" />
            </TouchableOpacity>
          </View>

          {/* Step tabs */}
          <View style={styles.stepTabs}>
            <TouchableOpacity
              style={[styles.stepTab, step === "pre" && styles.stepTabActive]}
              onPress={() => setStep("pre")}
            >
              <View
                style={[
                  styles.stepDot,
                  selectedPre
                    ? styles.stepDotDone
                    : step === "pre"
                      ? styles.stepDotActive
                      : {},
                ]}
              >
                {selectedPre ? (
                  <Feather name="check" size={10} color="#fff" />
                ) : (
                  <Text style={styles.stepDotText}>1</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepTabText,
                  step === "pre" && { color: PHASE_COLORS.pre.text },
                ]}
              >
                Select PRE
              </Text>
            </TouchableOpacity>
            <View style={styles.stepDivider} />
            <TouchableOpacity
              style={[styles.stepTab, step === "post" && styles.stepTabActive]}
              onPress={() => setStep("post")}
            >
              <View
                style={[
                  styles.stepDot,
                  selectedPost
                    ? styles.stepDotDone
                    : step === "post"
                      ? styles.stepDotActivePost
                      : {},
                ]}
              >
                {selectedPost ? (
                  <Feather name="check" size={10} color="#fff" />
                ) : (
                  <Text style={styles.stepDotText}>2</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepTabText,
                  step === "post" && { color: PHASE_COLORS.post.text },
                ]}
              >
                Select POST
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selection summary badges */}
          {(selectedPre || selectedPost) && (
            <View style={styles.selectionSummary}>
              {selectedPre && (
                <View
                  style={[
                    styles.summaryBadge,
                    {
                      backgroundColor: PHASE_COLORS.pre.bg,
                      borderColor: PHASE_COLORS.pre.border,
                    },
                  ]}
                >
                  <Feather
                    name="check-circle"
                    size={12}
                    color={PHASE_COLORS.pre.text}
                  />
                  <Text
                    style={[
                      styles.summaryBadgeText,
                      { color: PHASE_COLORS.pre.text },
                    ]}
                    numberOfLines={1}
                  >
                    PRE: {preLabel}
                  </Text>
                </View>
              )}
              {selectedPost && (
                <View
                  style={[
                    styles.summaryBadge,
                    {
                      backgroundColor: PHASE_COLORS.post.bg,
                      borderColor: PHASE_COLORS.post.border,
                    },
                  ]}
                >
                  <Feather
                    name="check-circle"
                    size={12}
                    color={PHASE_COLORS.post.text}
                  />
                  <Text
                    style={[
                      styles.summaryBadgeText,
                      { color: PHASE_COLORS.post.text },
                    ]}
                    numberOfLines={1}
                  >
                    POST: {postLabel}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Submission list */}
          <ScrollView
            style={styles.modalList}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {step === "pre" ? (
              preSubmissions.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Feather name="inbox" size={24} color="#6B6480" />
                  <Text style={styles.modalEmptyText}>
                    No PRE submissions available
                  </Text>
                </View>
              ) : (
                preSubmissions.map((sub) =>
                  renderSubmissionOption(sub, selectedPre === sub._id, () => {
                    setSelectedPre(sub._id);
                    setStep("post");
                  }),
                )
              )
            ) : postSubmissions.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Feather name="inbox" size={24} color="#6B6480" />
                <Text style={styles.modalEmptyText}>
                  No POST submissions available
                </Text>
              </View>
            ) : (
              postSubmissions.map((sub) =>
                renderSubmissionOption(sub, selectedPost === sub._id, () =>
                  setSelectedPost(sub._id),
                ),
              )
            )}
          </ScrollView>

          {/* Footer buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={handleReset}
            >
              <Text style={styles.modalCancelText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalGenerateBtn,
                !canGenerate && styles.modalGenerateBtnDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!canGenerate}
            >
              <Feather
                name="bar-chart-2"
                size={14}
                color={canGenerate ? "#0D0022" : "#6B6480"}
              />
              <Text
                style={[
                  styles.modalGenerateText,
                  !canGenerate && styles.modalGenerateTextDisabled,
                ]}
              >
                Generate Report
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function GroupDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { token } = useAdmin();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"pre" | "post" | "all">("pre");
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [viewLoading, setViewLoading] = useState<string | null>(null);

  const groupQuery = useQuery({
    queryKey: ["admin-group", params.id],
    queryFn: () =>
      adminFetch<{ group: Group }>(`/admin/groups/${params.id}`, token),
    enabled: !!params.id,
  });

  const submissionsQuery = useQuery({
    queryKey: ["admin-group-submissions", params.id, activeTab],
    queryFn: () => {
      const url =
        activeTab === "all"
          ? `/admin/groups/${params.id}/submissions`
          : `/admin/groups/${params.id}/submissions?phase=${activeTab}`;
      return adminFetch<{ submissions: Submission[]; group: Group }>(
        url,
        token,
      );
    },
    enabled: !!params.id,
  });

  // Fetch PRE and POST submissions for the compare modal (fetched on demand)
  const preQuery = useQuery({
    queryKey: ["admin-group-submissions", params.id, "pre"],
    queryFn: () =>
      adminFetch<{ submissions: Submission[] }>(
        `/admin/groups/${params.id}/submissions?phase=pre`,
        token,
      ),
    enabled: !!params.id && compareModalVisible,
  });

  const postQuery = useQuery({
    queryKey: ["admin-group-submissions", params.id, "post"],
    queryFn: () =>
      adminFetch<{ submissions: Submission[] }>(
        `/admin/groups/${params.id}/submissions?phase=post`,
        token,
      ),
    enabled: !!params.id && compareModalVisible,
  });

  const deleteMutation = useMutation({
    mutationFn: (responseId: string) =>
      adminFetch(`/admin/responses/${responseId}`, token, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-group-submissions", params.id],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
    },
  });

  // View report: same flow as the candidates tab
  const viewReport = async (id: string) => {
    setViewLoading(id);
    try {
      const candidate = await adminFetch<Candidate>(
        `/admin/candidate/${id}`,
        token,
      );
      const params = new URLSearchParams({
        submittedAt: candidate.submittedAt,
        totalResponses: String(candidate.totalResponses ?? 0),
        scores: JSON.stringify(candidate.scores ?? {}),
        candidateInfo: JSON.stringify(candidate.candidateInfo ?? {}),
        perceivedActual: JSON.stringify(candidate.perceivedActual ?? {}),
        composites: JSON.stringify(candidate.composites ?? {}),
        groupId: candidate.groupId ?? "",
      });
      router.push(`/report-intro?${params.toString()}`);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Unable to load report data",
      );
    } finally {
      setViewLoading(null);
    }
  };

  const generatePostMutation = useMutation({
    mutationFn: () =>
      adminFetch(`/admin/groups/${params.id}/generate-post`, token, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-group", params.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      setActiveTab("post");
    },
  });

  const generateGroupPDF = async (phase: "pre" | "post") => {
    setGeneratingPDF(true);
    try {
      const report = await adminFetch<{
        groupName: string;
        phase: string;
        candidateInfo: any;
        perceivedActual: any;
        composites: any;
        scores: any;
      }>(`/admin/groups/${params.id}/report?phase=${phase}`, token);
      const resp = await fetch(`${API_BASE}/pdf/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: params.id,
          candidateInfo: report.candidateInfo,
          perceivedActual: report.perceivedActual,
          composites: report.composites,
          scores: report.scores,
        }),
      });
      if (!resp.ok) {
        throw new Error(
          resp.status === 422
            ? "PDF generation failed: invalid payload"
            : `PDF download failed (${resp.status})`,
        );
      }
      const json = await resp.json();
      if (!json.pdf) throw new Error("No PDF returned");
      const safeName = `${report.groupName}_${phase}_report`.replace(
        /[^a-z0-9]+/gi,
        "_",
      );
      await downloadPdfBase64(json.pdf, `${safeName}.pdf`);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Could not generate PDF",
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

  const generateCombinedGroupPDF = async () => {
    setGeneratingPDF(true);
    try {
      const resp = await fetch(`${API_BASE}/pdf/group/combine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: params.id,
          groupNameLabel: "Candidate",
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(
          resp.status === 422
            ? `PDF generation failed: ${text}`
            : `PDF download failed (${resp.status})`,
        );
      }
      const json = await resp.json();
      if (!json.pdf) throw new Error("No PDF returned");
      const groupName = groupQuery.data?.group?.groupName ?? "group";
      const safeName = `${groupName}_combined_pre_post_report`.replace(
        /[^a-z0-9]+/gi,
        "_",
      );
      await downloadPdfBase64(json.pdf, `${safeName}.pdf`);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Could not generate PDF",
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

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

  const hasPost =
    !isLegacy && group?.phases?.some((p) => p.phaseType === "post");

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
              {group.cohort ? (
                <Text style={styles.legacyCohort}>{group.cohort}</Text>
              ) : null}
            </View>
          ) : null}

          {/* Phase codes */}
          {!isLegacy ? (
            <View style={styles.phaseCodesBlock}>
              {group.phases.map((phase) => {
                const colors =
                  PHASE_COLORS[phase.phaseType] ?? PHASE_COLORS.pre;
                return (
                  <View
                    key={phase.phaseType}
                    style={[
                      styles.phaseCodeCard,
                      {
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.phaseCodeLabelRow}>
                      <Text
                        style={[styles.phaseCodeLabel, { color: colors.text }]}
                      >
                        {phase.phaseType.toUpperCase()}
                      </Text>
                      {!phase.enabled && (
                        <Text style={styles.disabledTag}>DISABLED</Text>
                      )}
                    </View>
                    <Text
                      style={[styles.phaseCodeValue, { color: colors.text }]}
                    >
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
                      <Text style={styles.generatePostText}>
                        Generate POST Code
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Compare PRE vs POST button */}
              {hasPost && (
                <TouchableOpacity
                  style={styles.compareBtn}
                  onPress={() => setCompareModalVisible(true)}
                >
                  <Feather name="bar-chart-2" size={14} color="#FFEB00" />
                  <Text style={styles.compareBtnText}>Compare PRE vs POST</Text>
                </TouchableOpacity>
              )}

              {/* Group Report button */}
              <TouchableOpacity
                style={styles.groupReportBtn}
                onPress={() => setShowPhaseModal(true)}
              >
                <Feather name="pie-chart" size={14} color="#000" />
                <Text style={styles.groupReportBtnText}>Group Report</Text>
              </TouchableOpacity>


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
                  isActive && colors
                    ? { borderBottomColor: colors.text }
                    : null,
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
                  <Text
                    style={[
                      styles.phaseInfoCode,
                      { color: PHASE_COLORS.pre.text },
                    ]}
                  >
                    {prePhase.code}
                  </Text>
                </Text>
                {!prePhase.enabled && (
                  <Text style={styles.phaseDisabledNote}>
                    This phase is currently disabled — candidates cannot use
                    this code.
                  </Text>
                )}
              </>
            ) : null}
            {activeTab === "post" && postPhase ? (
              <>
                <Text style={styles.phaseInfoText}>
                  Code:{" "}
                  <Text
                    style={[
                      styles.phaseInfoCode,
                      { color: PHASE_COLORS.post.text },
                    ]}
                  >
                    {postPhase.code}
                  </Text>
                </Text>
                {!postPhase.enabled && (
                  <Text style={styles.phaseDisabledNote}>
                    This phase is currently disabled — candidates cannot use
                    this code.
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
                    <Text style={styles.generatePostText}>
                      + Generate POST Code
                    </Text>
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
          {submissionsQuery.isLoading ? (
            <ActivityIndicator color="#FFEB00" size="small" />
          ) : null}
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
                          backgroundColor:
                            PHASE_COLORS[sub.phase]?.bg ?? "#2D1156",
                          borderColor:
                            PHASE_COLORS[sub.phase]?.border ?? "#2D1156",
                        },
                      ]}
                    >
                      {sub.phase.toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text style={styles.subDate}>
                  {formatDate(sub.submittedAt)}
                </Text>
              </View>
            </View>
            <View style={styles.subRight}>
              <View style={styles.scoreChips}>
                <Text style={styles.scoreChip}>
                  S: {pct(sub.composites?.skills?.percent)}
                </Text>

                <Text style={styles.scoreChip}>
                  W: {pct(sub.composites?.will?.percent)}
                </Text>
              </View>

              <View style={styles.subActions}>
                {/* VIEW BUTTON */}
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => viewReport(sub._id)}
                  disabled={viewLoading === sub._id}
                >
                  {viewLoading === sub._id ? (
                    <ActivityIndicator size="small" color="#18012C" />
                  ) : (
                    <>
                      <Feather name="eye" size={14} color="#18012C" />
                      <Text style={styles.viewBtnText}>View</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* DELETE BUTTON */}
                <TouchableOpacity
                  onPress={() => handleDelete(sub)}
                  hitSlop={{
                    top: 8,
                    bottom: 8,
                    left: 8,
                    right: 8,
                  }}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending &&
                  deleteMutation.variables === sub._id ? (
                    <ActivityIndicator size="small" color="#D14343" />
                  ) : (
                    <Feather name="trash-2" size={16} color="#D14343" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Phase Selection Modal for Group Report */}
      <Modal visible={showPhaseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Phase for Group Report
              </Text>
            </View>
            <View style={{ padding: 16, gap: 12 }}>
              <TouchableOpacity
                style={[styles.phaseBtn, { backgroundColor: "#2e7d32" }]}
                disabled={generatingPDF}
                onPress={() => {
                  setShowPhaseModal(false);
                  generateGroupPDF("pre");
                }}
              >
                {generatingPDF ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.phaseBtnText}>PRE Survey Report</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.phaseBtn, { backgroundColor: "#1565c0" }]}
                disabled={generatingPDF}
                onPress={() => {
                  setShowPhaseModal(false);
                  generateGroupPDF("post");
                }}
              >
                {generatingPDF ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.phaseBtnText}>POST Survey Report</Text>
                )}
              </TouchableOpacity>
              {/* Combine Pre+Post Report button */}
              {hasPost && (
                <TouchableOpacity
                  style={styles.combineReportBtn}
                  onPress={generateCombinedGroupPDF}
                  disabled={generatingPDF}
                >
                  {generatingPDF ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Feather name="layers" size={14} color="#fff" />
                      <Text style={styles.combineReportBtnText}>
                        Combine Pre+Post Report
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setShowPhaseModal(false)}
                style={{ alignItems: "center", padding: 10 }}
              >
                <Text
                  style={{
                    color: "#9B8EC4",
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Compare Modal */}
      <CompareModal
        visible={compareModalVisible}
        onClose={() => setCompareModalVisible(false)}
        preSubmissions={preQuery.data?.submissions ?? []}
        postSubmissions={postQuery.data?.submissions ?? []}
        groupId={params.id}
        onNavigate={(preId, postId) => {
          router.push({
            pathname: "/admin/compare-report",
            params: { preId, postId, groupId: params.id },
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0022" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D0022",
  },
  errorText: {
    color: "#D14343",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: "#FFEB00",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
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
  compareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#1A1200",
    borderWidth: 1,
    borderColor: "#FFEB00",
    borderRadius: 8,
    paddingVertical: 11,
  },
  compareBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#FFEB00",
  },
  groupReportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#f5c842",
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
  },
  groupReportBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#000",
  },
  combineReportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#6a1b9a",
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
  },
  combineReportBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#fff",
  },
  phaseBtn: {
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  phaseBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
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
  subNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
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

  // ── Modal styles ──────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#1E0A38",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#2D1156",
    maxHeight: "85%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2D1156",
  },
  modalTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  stepTabs: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 0,
  },
  stepTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepTabActive: {},
  stepDivider: {
    width: 24,
    height: 1,
    backgroundColor: "#2D1156",
    marginHorizontal: 4,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2D1156",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: { backgroundColor: "#166534" },
  stepDotActivePost: { backgroundColor: "#3730A3" },
  stepDotDone: { backgroundColor: "#22C55E" },
  stepDotText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#6B6480",
  },
  stepTabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#6B6480",
  },
  selectionSummary: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexWrap: "wrap",
  },
  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: "48%",
  },
  summaryBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    flex: 1,
  },
  modalList: {
    paddingHorizontal: 16,
    maxHeight: 340,
  },
  modalEmpty: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  modalEmptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#6B6480",
  },
  subOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#150826",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2D1156",
  },
  subOptionSelected: {
    borderColor: "#FFEB00",
    backgroundColor: "#1A1200",
  },
  subOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  subOptionRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#6B6480",
    alignItems: "center",
    justifyContent: "center",
  },
  subOptionRadioSelected: {
    borderColor: "#FFEB00",
  },
  subOptionRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFEB00",
  },
  subOptionName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  subOptionMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#9B8EC4",
    marginTop: 2,
  },
  subOptionScores: {
    gap: 3,
    alignItems: "flex-end",
  },
  subOptionScore: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#FFEB00",
    backgroundColor: "#2D1156",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#2D1156",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2D1156",
    alignItems: "center",
  },
  modalCancelText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#9B8EC4",
  },
  modalGenerateBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FFEB00",
  },
  modalGenerateBtnDisabled: {
    backgroundColor: "#2D1156",
  },
  modalGenerateText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#0D0022",
  },
  modalGenerateTextDisabled: {
    color: "#6B6480",
  },
  subActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },

  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFEB00",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  viewBtnText: {
    color: "#18012C",
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
});
