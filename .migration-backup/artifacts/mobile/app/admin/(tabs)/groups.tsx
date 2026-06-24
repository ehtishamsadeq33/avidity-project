import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
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
  submissionCount: number;
  phaseCounts: Record<string, number>;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pre: { bg: "#0D2E1A", text: "#4ADE80", border: "#166534" },
  post: { bg: "#1A1635", text: "#818CF8", border: "#3730A3" },
};

export default function GroupsScreen() {
  const router = useRouter();
  const { token } = useAdmin();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-groups"],
    queryFn: () => adminFetch<{ groups: Group[] }>("/admin/groups", token),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/admin/groups/${id}`, token, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-groups"] }),
  });

  const generatePostMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/admin/groups/${id}/generate-post`, token, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-groups"] }),
  });

  const togglePhaseMutation = useMutation({
    mutationFn: ({ id, phaseType }: { id: string; phaseType: string }) =>
      adminFetch(`/admin/groups/${id}/phases/${phaseType}/toggle`, token, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-groups"] }),
  });

  const handleDelete = (group: Group) => {
    Alert.alert(
      "Delete Group",
      `Delete "${group.groupName}"? All submission links will be lost. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(group._id),
        },
      ],
    );
  };

  const handleGeneratePost = (group: Group) => {
    Alert.alert(
      "Generate POST Code",
      `Create a POST survey phase for "${group.groupName}"? A new code will be generated automatically.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate",
          onPress: () => generatePostMutation.mutate(group._id),
        },
      ],
    );
  };

  const handleTogglePhase = (group: Group, phase: Phase) => {
    const action = phase.enabled ? "disable" : "enable";
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} ${phase.phaseType.toUpperCase()} Phase`,
      `${action === "disable" ? "Candidates will not be able to use this code." : "Candidates will be able to use this code again."} Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: action === "disable" ? "destructive" : "default",
          onPress: () => togglePhaseMutation.mutate({ id: group._id, phaseType: phase.phaseType }),
        },
      ],
    );
  };

  const groups = data?.groups ?? [];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FFEB00" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load groups</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={groups}
        keyExtractor={(g) => g._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="grid" size={40} color="#9B8EC4" />
            <Text style={styles.emptyTitle}>No Groups Yet</Text>
            <Text style={styles.emptyBody}>
              Create a group to get started. A PRE survey code will be generated automatically.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isLegacy = !item.phases || item.phases.length === 0;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.groupName}</Text>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="trash-2" size={16} color="#D14343" />
                </TouchableOpacity>
              </View>

              {item.organization ? (
                <Text style={styles.cardOrg}>{item.organization}</Text>
              ) : null}

              {isLegacy ? (
                // Legacy group: show single code
                <View style={styles.legacyCodeRow}>
                  <Feather name="hash" size={13} color="#FFEB00" />
                  <Text style={styles.legacyCodeText}>{item.groupCode}</Text>
                  {item.cohort ? (
                    <Text style={styles.legacyCohort}>{item.cohort}</Text>
                  ) : null}
                </View>
              ) : (
                // New group: show PRE/POST phases
                <View style={styles.phasesBlock}>
                  {item.phases.map((phase) => {
                    const colors = PHASE_COLORS[phase.phaseType] ?? PHASE_COLORS.pre;
                    const count = item.phaseCounts?.[phase.phaseType] ?? 0;
                    return (
                      <View
                        key={phase.phaseType}
                        style={[styles.phaseRow, { borderColor: colors.border, backgroundColor: colors.bg }]}
                      >
                        <View style={styles.phaseLeft}>
                          <View style={styles.phaseLabelRow}>
                            <Text style={[styles.phaseLabel, { color: colors.text }]}>
                              {phase.phaseType.toUpperCase()}
                            </Text>
                            {!phase.enabled && (
                              <Text style={styles.disabledTag}>DISABLED</Text>
                            )}
                          </View>
                          <Text style={[styles.phaseCode, { color: colors.text }]}>
                            {phase.code}
                          </Text>
                          <Text style={styles.phaseCount}>
                            {count} {count === 1 ? "submission" : "submissions"}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.toggleBtn,
                            { borderColor: colors.border },
                            phase.enabled ? styles.toggleBtnActive : styles.toggleBtnDisabled,
                          ]}
                          onPress={() => handleTogglePhase(item, phase)}
                          disabled={togglePhaseMutation.isPending}
                        >
                          <Feather
                            name={phase.enabled ? "toggle-right" : "toggle-left"}
                            size={18}
                            color={phase.enabled ? colors.text : "#6B6480"}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}

                  {!item.phases.some((p) => p.phaseType === "post") && (
                    <TouchableOpacity
                      style={styles.generatePostBtn}
                      onPress={() => handleGeneratePost(item)}
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
              )}

              <View style={styles.cardFooter}>
                <View style={styles.cardBadge}>
                  <Feather name="file-text" size={12} color="#9B8EC4" />
                  <Text style={styles.cardBadgeText}>
                    {item.submissionCount ?? 0} total
                  </Text>
                </View>
                <View style={styles.footerRight}>
                  <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() =>
                      router.push({ pathname: "/admin/group-detail", params: { id: item._id } })
                    }
                  >
                    <Text style={styles.viewBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)} activeOpacity={0.85}>
        <Feather name="plus" size={24} color="#000000" />
      </TouchableOpacity>

      <CreateGroupModal
        visible={showCreate}
        token={token}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
        }}
      />
    </View>
  );
}

function CreateGroupModal({
  visible,
  token,
  onClose,
  onCreated,
}: {
  visible: boolean;
  token: string | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [groupName, setGroupName] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setGroupName("");
    setOrganization("");
    setDescription("");
    setError("");
    setSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!groupName.trim()) { setError("Group name is required"); return; }
    setSaving(true);
    setError("");
    try {
      await adminFetch("/admin/groups", token, {
        method: "POST",
        body: {
          groupName: groupName.trim(),
          organization: organization.trim(),
          description: description.trim(),
        },
      });
      reset();
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create group");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={modal.root}>
        <View style={modal.header}>
          <Text style={modal.title}>Create Group</Text>
          <TouchableOpacity onPress={handleClose}>
            <Feather name="x" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={modal.scroll} contentContainerStyle={modal.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={modal.infoBox}>
            <Feather name="info" size={14} color="#FFEB00" />
            <Text style={modal.infoText}>
              A PRE survey code will be generated automatically. You can add a POST code later.
            </Text>
          </View>

          <Text style={modal.label}>Group Name <Text style={modal.req}>*</Text></Text>
          <TextInput
            style={modal.input}
            placeholder="e.g. Marketing Team Batch 1"
            placeholderTextColor="#888"
            value={groupName}
            onChangeText={setGroupName}
          />

          <Text style={modal.label}>Organization</Text>
          <TextInput
            style={modal.input}
            placeholder="e.g. Acme Corp"
            placeholderTextColor="#888"
            value={organization}
            onChangeText={setOrganization}
          />

          <Text style={modal.label}>Description</Text>
          <TextInput
            style={[modal.input, modal.textarea]}
            placeholder="Optional notes about this group"
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {error ? <Text style={modal.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[modal.saveBtn, saving && modal.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={modal.saveBtnText}>Create Group</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0022" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D0022" },
  errorText: { color: "#D14343", fontFamily: "Inter_500Medium", fontSize: 14, marginBottom: 12 },
  retryBtn: { backgroundColor: "#FFEB00", borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#000" },
  listContent: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#9B8EC4",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#1E0A38",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D1156",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardTitle: { fontFamily: "Montserrat_700Bold", fontSize: 16, color: "#FFFFFF", flex: 1, marginRight: 10 },
  cardOrg: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#9B8EC4", marginBottom: 12 },
  legacyCodeRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 12 },
  legacyCodeText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#FFEB00", letterSpacing: 2 },
  legacyCohort: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#FFEB00",
    backgroundColor: "#2D1156",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  phasesBlock: { marginBottom: 12, gap: 8 },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  phaseLeft: { flex: 1 },
  phaseLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  phaseLabel: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 1 },
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
  phaseCode: { fontFamily: "Inter_700Bold", fontSize: 13, letterSpacing: 2, marginBottom: 2 },
  phaseCount: { fontFamily: "Inter_400Regular", fontSize: 11, color: "#9B8EC4" },
  toggleBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 8,
  },
  toggleBtnActive: { backgroundColor: "transparent" },
  toggleBtnDisabled: { backgroundColor: "transparent", opacity: 0.5 },
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
    marginTop: 2,
  },
  generatePostText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#818CF8",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#2D1156",
    paddingTop: 10,
    marginTop: 4,
  },
  cardBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  cardBadgeText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#9B8EC4" },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardDate: { fontFamily: "Inter_400Regular", fontSize: 12, color: "#6B6480" },
  viewBtn: {
    backgroundColor: "#2D1156",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  viewBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#FFEB00" },
  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFEB00",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0022" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#18012C",
    borderBottomWidth: 1,
    borderBottomColor: "#2D1156",
  },
  title: { fontFamily: "Montserrat_700Bold", fontSize: 18, color: "#FFFFFF" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#1E1500",
    borderWidth: 1,
    borderColor: "#3D2E00",
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  infoText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#D9B800",
    flex: 1,
    lineHeight: 18,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#D9CDE8",
    marginBottom: 6,
    marginTop: 16,
  },
  req: { color: "#D14343" },
  input: {
    backgroundColor: "#1E0A38",
    borderWidth: 1,
    borderColor: "#2D1156",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
  },
  textarea: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  error: {
    color: "#D14343",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 12,
  },
  saveBtn: {
    backgroundColor: "#FFEB00",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#000000" },
});
