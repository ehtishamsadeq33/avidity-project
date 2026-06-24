import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import ReportPage1Content, {
  type CandidateInfo,
  type Composites,
  type PerceivedActual,
} from "@/components/ReportPage1Content";
import ReportPage2Content from "@/components/ReportPage2Content";
import ReportPage3Content from "@/components/ReportPage3Content";
import { adminFetch } from "@/lib/api";
import { useAdmin } from "@/context/AdminContext";
import type { GroupAverages } from "@/components/ReportPage2Content";

function safeParse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export default function ReportPage3() {
  const router = useRouter();
  const { token } = useAdmin();
  const params = useLocalSearchParams<{
    composites?: string;
    candidateInfo?: string;
    perceivedActual?: string;
    scores?: string;
    totalResponses?: string;
    submittedAt?: string;
    groupId?: string;
  }>();

  const composites = useMemo<Composites>(() => safeParse<Composites>(params.composites, {}), [params.composites]);
  const candidateInfo = useMemo<CandidateInfo>(() => safeParse<CandidateInfo>(params.candidateInfo, {}), [params.candidateInfo]);
  const perceivedActual = useMemo<PerceivedActual>(() => safeParse<PerceivedActual>(params.perceivedActual, {}), [params.perceivedActual]);
  const scores: Record<string, number> = useMemo(() => { try { return params.scores ? JSON.parse(params.scores) : {}; } catch { return {}; } }, [params.scores]);
  const totalResponses = Number(params.totalResponses ?? 0);
  const groupId = params.groupId ?? "";

  const [groupAverages, setGroupAverages] = useState<GroupAverages | null>(null);

  useEffect(() => {
    if (!groupId) return;
    adminFetch<GroupAverages>(`/admin/groups/${groupId}/averages`, token)
      .then((d) => setGroupAverages(d))
      .catch(() => {});
  }, [groupId, token]);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ReportPage1Content candidateInfo={candidateInfo} perceivedActual={perceivedActual} composites={composites} scores={scores} totalResponses={totalResponses} groupAverages={groupAverages} />
        <ReportPage2Content candidateInfo={candidateInfo} composites={composites} groupAverages={groupAverages} />
        <ReportPage3Content composites={composites} />
      </ScrollView>
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => router.navigate("/admin/(tabs)/candidates")} style={styles.backButton}>
          <Text style={styles.backButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fffde7" },
  scrollContent: { padding: 16, paddingBottom: 20 },
  buttonRow: { flexDirection: "row", padding: 16, gap: 12, backgroundColor: "#fffde7", borderTopWidth: 1, borderTopColor: "#f0e6b8" },
  backButton: { flex: 1, backgroundColor: "#f5c842", padding: 14, borderRadius: 10, alignItems: "center" },
  backButtonText: { fontWeight: "bold", fontSize: 16, color: "#000" },
});
