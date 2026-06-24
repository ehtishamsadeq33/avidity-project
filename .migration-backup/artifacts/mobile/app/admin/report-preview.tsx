import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import { useAdmin } from "@/context/AdminContext";
import { adminFetch } from "@/lib/api";

interface ReportHTMLResponse {
  html: string;
}

export default function ReportPreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAdmin();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminFetch<ReportHTMLResponse>(`/admin/report/${id}/html`, token)
      .then((data) => {
        setHtml(data.html);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load report");
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FFEB00" size="large" />
        <Text style={styles.loadingText}>Loading report…</Text>
      </View>
    );
  }

  if (error || !html) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? "Report not found"}</Text>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.root}>
        {/* @ts-expect-error iframe is valid on web */}
        <iframe
          srcDoc={html}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="CRA Report Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Report preview is available on web only.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E0020",
    gap: 12,
  },
  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#D9CDE8",
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#9B8EC4",
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
