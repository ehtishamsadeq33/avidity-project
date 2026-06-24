import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { useAdmin } from "@/context/AdminContext";
import { adminFetch } from "@/lib/api";

interface AdminUser {
  _id: string;
  username: string;
  createdAt: string;
}

export default function SettingsScreen() {
  const { token, username } = useAdmin();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [newUsername, setNewUsername] = useState("");
  const [newAdminPw, setNewAdminPw] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const loadAdmins = useCallback(async () => {
    try {
      const data = await adminFetch<{ admins: AdminUser[] }>("/admin/users", token);
      setAdmins(data.admins);
    } catch { /* ignore */ }
    finally { setLoadingAdmins(false); }
  }, [token]);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  const changePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      return Alert.alert("Error", "All fields are required");
    }
    if (newPw !== confirmPw) {
      return Alert.alert("Error", "New passwords don't match");
    }
    if (newPw.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters");
    }
    setPwLoading(true);
    try {
      await adminFetch("/admin/password", token, {
        method: "PUT",
        body: { currentPassword: currentPw, newPassword: newPw },
      });
      Alert.alert("Success", "Password updated successfully");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newUsername.trim() || !newAdminPw.trim()) {
      return Alert.alert("Error", "Username and password are required");
    }
    setAddLoading(true);
    try {
      await adminFetch("/admin/users", token, {
        method: "POST",
        body: { username: newUsername.trim(), password: newAdminPw },
      });
      Alert.alert("Success", `Admin "${newUsername}" created`);
      setNewUsername(""); setNewAdminPw("");
      await loadAdmins();
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add admin");
    } finally {
      setAddLoading(false);
    }
  };

  const removeAdmin = (admin: AdminUser) => {
    Alert.alert("Remove Admin", `Remove "${admin.username}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          try {
            await adminFetch(`/admin/users/${admin._id}`, token, { method: "DELETE" });
            await loadAdmins();
          } catch (e) {
            Alert.alert("Error", e instanceof Error ? e.message : "Failed");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>

      {/* Change Password */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <Text style={styles.sectionSub}>Logged in as: {username}</Text>

        <Text style={styles.label}>Current Password</Text>
        <TextInput style={styles.input} value={currentPw} onChangeText={setCurrentPw} secureTextEntry placeholder="••••••••" placeholderTextColor="#9B8EC4" />

        <Text style={styles.label}>New Password</Text>
        <TextInput style={styles.input} value={newPw} onChangeText={setNewPw} secureTextEntry placeholder="••••••••" placeholderTextColor="#9B8EC4" />

        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput style={styles.input} value={confirmPw} onChangeText={setConfirmPw} secureTextEntry placeholder="••••••••" placeholderTextColor="#9B8EC4" />

        <TouchableOpacity style={styles.button} onPress={changePassword} disabled={pwLoading}>
          {pwLoading ? <ActivityIndicator color="#18012C" /> : <Text style={styles.buttonText}>Update Password</Text>}
        </TouchableOpacity>
      </View>

      {/* Admin Users */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Users</Text>

        {loadingAdmins ? (
          <ActivityIndicator color="#FFEB00" style={{ marginVertical: 16 }} />
        ) : (
          admins.map((a) => (
            <View key={a._id} style={styles.adminRow}>
              <View style={styles.adminAvatar}>
                <Text style={styles.adminAvatarText}>{a.username[0]?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminUsername}>{a.username}</Text>
                <Text style={styles.adminDate}>Added {new Date(a.createdAt).toLocaleDateString()}</Text>
              </View>
              {a.username !== username && (
                <TouchableOpacity onPress={() => removeAdmin(a)} style={styles.removeButton}>
                  <Feather name="trash-2" size={16} color="#D14343" />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

      {/* Add Admin */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Admin User</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={newUsername} onChangeText={setNewUsername} autoCapitalize="none" autoCorrect={false} placeholder="newadmin" placeholderTextColor="#9B8EC4" />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={newAdminPw} onChangeText={setNewAdminPw} secureTextEntry placeholder="••••••••" placeholderTextColor="#9B8EC4" />

        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={addAdmin} disabled={addLoading}>
          {addLoading ? <ActivityIndicator color="#FFEB00" /> : (
            <>
              <Feather name="user-plus" size={18} color="#FFEB00" />
              <Text style={[styles.buttonText, { color: "#FFEB00" }]}>Add Admin</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0E0020" },
  content: { padding: 16, paddingBottom: 60 },
  pageTitle: { fontFamily: "Montserrat_700Bold", fontSize: 24, color: "#FFEB00", marginBottom: 20 },
  section: { backgroundColor: "#18012C", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#2D1156", gap: 10, marginBottom: 16 },
  sectionTitle: { fontFamily: "Montserrat_700Bold", fontSize: 16, color: "#FFFFFF" },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "#9B8EC4", marginTop: -4 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#D9CDE8" },
  input: {
    backgroundColor: "#0E0020", borderRadius: 8, borderWidth: 1, borderColor: "#2D1156",
    padding: 12, color: "#FFFFFF", fontFamily: "Inter_400Regular", fontSize: 14,
  },
  button: {
    backgroundColor: "#FFEB00", borderRadius: 10, padding: 14,
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8,
  },
  buttonSecondary: { backgroundColor: "#2D1156", borderWidth: 1, borderColor: "#FFEB00" },
  buttonText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#18012C" },
  adminRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#2D1156" },
  adminAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#2D1156", alignItems: "center", justifyContent: "center" },
  adminAvatarText: { fontFamily: "Montserrat_700Bold", fontSize: 16, color: "#FFEB00" },
  adminUsername: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFFFFF" },
  adminDate: { fontFamily: "Inter_400Regular", fontSize: 11, color: "#9B8EC4" },
  removeButton: { width: 34, height: 34, borderRadius: 8, backgroundColor: "rgba(209,67,67,0.15)", alignItems: "center", justifyContent: "center" },
});
