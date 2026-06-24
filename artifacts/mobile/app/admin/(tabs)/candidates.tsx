import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { useAdmin } from "@/context/AdminContext";
import { adminFetch } from "@/lib/api";

interface Candidate {
  _id: string;
  name: string;
  email: string;
  company: string;
  submittedAt: string;
  icNumber?: string;
  groupId?: string;
  groupName?: string;
  submissionType?: "individual" | "group";
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
  scores?: Record<string, number>;
  totalResponses?: number;
}

interface CandidatesResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  pages: number;
}

const AGE_OPTIONS = [
  "",
  "20-25",
  "26-30",
  "31-35",
  "36-40",
  "41-45",
  "46-50",
  "51-55",
  "56-60",
  "60+",
];
const YEARS_OPTIONS = [
  "",
  "Less than 1 year",
  "1-2 years",
  "3-5 years",
  "6-10 years",
  "11-15 years",
  "16-20 years",
  "21 Years And More",
];

function FilterModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={{ maxHeight: 320 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt || "all"}
                style={[
                  styles.modalOption,
                  selected === opt && styles.modalOptionActive,
                ]}
                onPress={() => {
                  onSelect(opt);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selected === opt && styles.modalOptionTextActive,
                  ]}
                >
                  {opt || "All"}
                </Text>
                {selected === opt && (
                  <Feather name="check" size={14} color="#18012C" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

type SubmissionTypeFilter = "" | "individual" | "group";

export default function CandidatesScreen() {
  const { token } = useAdmin();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [yearsInOrg, setYearsInOrg] = useState("");
  const [yearsInPos, setYearsInPos] = useState("");
  const [submissionType, setSubmissionType] =
    useState<SubmissionTypeFilter>("");
  const [data, setData] = useState<CandidatesResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState<string | null>(null);

  const [showGender, setShowGender] = useState(false);
  const [showAge, setShowAge] = useState(false);
  const [showYearsOrg, setShowYearsOrg] = useState(false);
  const [showYearsPos, setShowYearsPos] = useState(false);

  const load = useCallback(
    async (
      p = 1,
      q = search,
      g = gender,
      a = age,
      yOrg = yearsInOrg,
      yPos = yearsInPos,
      sType = submissionType,
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p), limit: "20" });
        if (q) params.set("search", q);
        if (g) params.set("gender", g);
        if (a) params.set("age", a);
        if (yOrg) params.set("yearsInOrganization", yOrg);
        if (yPos) params.set("yearsInPosition", yPos);
        if (sType) params.set("submissionType", sType);
        const result = await adminFetch<CandidatesResponse>(
          `/admin/candidates?${params}`,
          token,
        );
        setData(result);
        setPage(p);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [token, search, gender, age, yearsInOrg, yearsInPos, submissionType],
  );

  useEffect(() => {
    load(1);
  }, []);

  const applyFilter = (g: string, a: string, yOrg: string, yPos: string) => {
    load(1, search, g, a, yOrg, yPos, submissionType);
  };

  const setTypeFilter = (t: SubmissionTypeFilter) => {
    setSubmissionType(t);
    load(1, search, gender, age, yearsInOrg, yearsInPos, t);
  };

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

  const downloadPDF = async (candidate: Candidate) => {
    const {
      _id: id,
      name,
      candidateInfo,
      perceivedActual,
      composites,
      scores,
      groupId,
    } = candidate;
    setPdfLoading(id);
    try {
      const result = await adminFetch<{ pdf: string }>(`/pdf`, token, {
        method: "POST",
        body: {
          candidateInfo: candidateInfo ?? {},
          perceivedActual: perceivedActual ?? {},
          composites: composites ?? {},
          scores: scores ?? {},
          groupId: groupId ?? null,
        },
      });
      const safeName = name.replace(/[^a-z0-9]+/gi, "_");

      if (Platform.OS === "web") {
        const byteChars = atob(result.pdf);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNums[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNums);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `CRA_${safeName}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      const fileUri =
        (FileSystem.documentDirectory ?? "") + `CRA_${safeName}.pdf`;
      await FileSystem.writeAsStringAsync(fileUri, result.pdf, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: "Download CRA Report",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Saved", fileUri);
      }
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "PDF failed");
    } finally {
      setPdfLoading(null);
    }
  };

  const chipLabel = (value: string, placeholder: string) =>
    value
      ? value.length > 10
        ? value.slice(0, 10) + "…"
        : value
      : placeholder;

  const renderItem = ({ item }: { item: Candidate }) => {
    const displayName = item.candidateInfo?.name || item.name;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(displayName || "?")[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.candidateName}>{displayName}</Text>
              {item.submissionType === "group" && (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>GROUP</Text>
                </View>
              )}
            </View>
            {item.icNumber ? (
              <Text style={styles.icText}>IC: {item.icNumber}</Text>
            ) : null}
            {item.groupName ? (
              <Text style={styles.groupText}>Group: {item.groupName}</Text>
            ) : null}
            <Text style={styles.candidateMeta}>
              {[
                item.candidateInfo?.gender,
                item.candidateInfo?.age,
                item.candidateInfo?.yearsInOrganization,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
            <Text style={styles.candidateDate}>
              {new Date(item.submittedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.scoreRow}>
          <ScoreChip
            label="Skills"
            value={item.composites?.skills?.percent}
            color="#2e7d32"
          />
          <ScoreChip
            label="Will"
            value={item.composites?.will?.percent}
            color="#e65100"
          />
          <ScoreChip
            label="Env"
            value={item.composites?.environmentalSupport?.percent}
            color="#6a1b9a"
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => viewReport(item._id)}
            disabled={viewLoading === item._id}
          >
            {viewLoading === item._id ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name="eye" size={14} color="#FFFFFF" />
                <Text style={styles.viewButtonText}>View</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pdfButton,
              pdfLoading === item._id && styles.buttonDisabled,
            ]}
            onPress={() => downloadPDF(item)}
            disabled={pdfLoading === item._id}
          >
            {pdfLoading === item._id ? (
              <ActivityIndicator color="#18012C" size="small" />
            ) : (
              <>
                <Feather name="download" size={14} color="#18012C" />
                <Text style={styles.pdfButtonText}>PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <FilterModal
        visible={showGender}
        title="Gender"
        options={["", "Male", "Female"]}
        selected={gender}
        onSelect={(v) => {
          setGender(v);
          applyFilter(v, age, yearsInOrg, yearsInPos);
        }}
        onClose={() => setShowGender(false)}
      />
      <FilterModal
        visible={showAge}
        title="Age"
        options={AGE_OPTIONS}
        selected={age}
        onSelect={(v) => {
          setAge(v);
          applyFilter(gender, v, yearsInOrg, yearsInPos);
        }}
        onClose={() => setShowAge(false)}
      />
      <FilterModal
        visible={showYearsOrg}
        title="Years in Organization"
        options={YEARS_OPTIONS}
        selected={yearsInOrg}
        onSelect={(v) => {
          setYearsInOrg(v);
          applyFilter(gender, age, v, yearsInPos);
        }}
        onClose={() => setShowYearsOrg(false)}
      />
      <FilterModal
        visible={showYearsPos}
        title="Years in Position"
        options={YEARS_OPTIONS}
        selected={yearsInPos}
        onSelect={(v) => {
          setYearsInPos(v);
          applyFilter(gender, age, yearsInOrg, v);
        }}
        onClose={() => setShowYearsPos(false)}
      />

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or IC…"
          placeholderTextColor="#9B8EC4"
          onSubmitEditing={() =>
            load(1, search, gender, age, yearsInOrg, yearsInPos, submissionType)
          }
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() =>
            load(1, search, gender, age, yearsInOrg, yearsInPos, submissionType)
          }
        >
          <Feather name="search" size={18} color="#18012C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
        directionalLockEnabled
        alwaysBounceVertical={false}
        nestedScrollEnabled={false}
        bounces={false}
        overScrollMode="never"
      >
        <TouchableOpacity
          style={[styles.filterChip, gender && styles.filterChipActive]}
          onPress={() => setShowGender(true)}
        >
          <Text
            style={[
              styles.filterChipText,
              gender && styles.filterChipTextActive,
            ]}
          >
            {chipLabel(gender, "Gender")}
          </Text>
          <Feather
            name="chevron-down"
            size={12}
            color={gender ? "#18012C" : "#D9CFFF"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, age && styles.filterChipActive]}
          onPress={() => setShowAge(true)}
        >
          <Text
            style={[styles.filterChipText, age && styles.filterChipTextActive]}
          >
            {chipLabel(age, "Age")}
          </Text>
          <Feather
            name="chevron-down"
            size={12}
            color={age ? "#18012C" : "#D9CFFF"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, yearsInOrg && styles.filterChipActive]}
          onPress={() => setShowYearsOrg(true)}
        >
          <Text
            style={[
              styles.filterChipText,
              yearsInOrg && styles.filterChipTextActive,
            ]}
          >
            {chipLabel(yearsInOrg, "Yrs in Org")}
          </Text>
          <Feather
            name="chevron-down"
            size={12}
            color={yearsInOrg ? "#18012C" : "#D9CFFF"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, yearsInPos && styles.filterChipActive]}
          onPress={() => setShowYearsPos(true)}
        >
          <Text
            style={[
              styles.filterChipText,
              yearsInPos && styles.filterChipTextActive,
            ]}
          >
            {chipLabel(yearsInPos, "Yrs in Pos")}
          </Text>
          <Feather
            name="chevron-down"
            size={12}
            color={yearsInPos ? "#18012C" : "#D9CFFF"}
          />
        </TouchableOpacity>

        {(gender || age || yearsInOrg || yearsInPos) && (
          <TouchableOpacity
            style={styles.clearChip}
            onPress={() => {
              setGender("");
              setAge("");
              setYearsInOrg("");
              setYearsInPos("");
              load(1, search, "", "", "", "");
            }}
          >
            <Feather name="x" size={12} color="#FF6B6B" />
            <Text style={styles.clearChipText}>Clear</Text>
          </TouchableOpacity>
        )}

        {data && <Text style={styles.totalText}>{data.total} total</Text>}
      </ScrollView>

      {loading && !data ? (
        <View style={styles.center}>
          <ActivityIndicator color="#FFEB00" size="large" />
        </View>
      ) : (
        <FlatList
          data={data?.candidates ?? []}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No candidates found</Text>
          }
          ListFooterComponent={
            data && data.pages > 1 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  disabled={page <= 1}
                  onPress={() => load(page - 1)}
                  style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                >
                  <Text style={styles.pageBtnText}>← Prev</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>
                  {page} / {data.pages}
                </Text>
                <TouchableOpacity
                  disabled={page >= data.pages}
                  onPress={() => load(page + 1)}
                  style={[
                    styles.pageBtn,
                    page >= data.pages && styles.pageBtnDisabled,
                  ]}
                >
                  <Text style={styles.pageBtnText}>Next →</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

function ScoreChip({
  label,
  value,
  color,
}: {
  label: string;
  value?: number;
  color: string;
}) {
  return (
    <View style={[styles.scoreChip, { borderColor: color }]}>
      <Text style={[styles.scoreChipValue, { color }]}>
        {(value ?? 0).toFixed(1)}%
      </Text>
      <Text style={styles.scoreChipLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0E0020" },
  searchBar: { flexDirection: "row", padding: 16, gap: 8 },
  searchInput: {
    flex: 1,
    backgroundColor: "#1C0D35",
    color: "#fff",
    padding: 12,
    borderRadius: 12,
  },
  searchButton: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEB00",
    borderRadius: 12,
  },
  filterScroll: { maxHeight: 60 },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
    paddingBottom: 8,
    minHeight: 50,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#1C0D35",
  },
  filterChipActive: { backgroundColor: "#FFEB00" },
  filterChipText: { color: "#D9CFFF", fontWeight: "600", fontSize: 12 },
  filterChipTextActive: { color: "#18012C" },
  clearChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#1C0D35",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  clearChipText: { color: "#FF6B6B", fontWeight: "600", fontSize: 12 },
  totalText: { color: "#D9CFFF", fontSize: 12, marginLeft: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, gap: 12 },
  emptyText: { color: "#D9CFFF", textAlign: "center", marginTop: 24 },
  card: { backgroundColor: "#18012C", borderRadius: 20, padding: 16, gap: 12 },
  cardHeader: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFEB00",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#18012C", fontWeight: "800", fontSize: 18 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  candidateName: { color: "#fff", fontSize: 18, fontWeight: "700" },
  typeBadge: {
    backgroundColor: "#2D1156",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#FFEB00",
    letterSpacing: 0.5,
  },
  icText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#D9CDE8",
    marginTop: 2,
  },
  groupText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#9B8EC4",
    marginTop: 1,
  },
  candidateMeta: { color: "#C9BDE8", marginTop: 2 },
  candidateDate: { color: "#9B8EC4", marginTop: 2, fontSize: 12 },
  typeToggleRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  typeToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#1C0D35",
  },
  typeToggleBtnActive: { backgroundColor: "#FFEB00" },
  typeToggleText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#D9CFFF",
  },
  typeToggleTextActive: { color: "#18012C" },
  scoreRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  scoreChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 88,
  },
  scoreChipValue: { fontSize: 16, fontWeight: "800" },
  scoreChipLabel: { color: "#fff", fontSize: 12, marginTop: 2 },
  buttonRow: { flexDirection: "row", gap: 10 },
  viewButton: {
    flex: 1,
    backgroundColor: "#6a1b9a",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  viewButtonText: { color: "#fff", fontWeight: "700" },
  pdfButton: {
    flex: 1,
    backgroundColor: "#FFEB00",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  pdfButtonText: { color: "#18012C", fontWeight: "700" },
  buttonDisabled: { opacity: 0.7 },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  pageBtn: {
    backgroundColor: "#1C0D35",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { color: "#fff", fontWeight: "700" },
  pageInfo: { color: "#D9CFFF", fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#1C0D35",
    borderRadius: 16,
    padding: 16,
    width: "80%",
    borderWidth: 1,
    borderColor: "#2D1156",
  },
  modalTitle: {
    color: "#FFEB00",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalOptionActive: { backgroundColor: "#FFEB00" },
  modalOptionText: { color: "#D9CFFF", fontSize: 14 },
  modalOptionTextActive: { color: "#18012C", fontWeight: "700" },
});
