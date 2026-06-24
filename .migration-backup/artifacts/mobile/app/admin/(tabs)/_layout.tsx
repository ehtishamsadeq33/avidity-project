import React from "react";
import { Tabs, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useAdmin } from "@/context/AdminContext";

export default function AdminTabsLayout() {
  const { logout } = useAdmin();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFEB00",
        tabBarInactiveTintColor: "#9B8EC4",
        tabBarStyle: { backgroundColor: "#18012C", borderTopColor: "#2D1156" },
        tabBarLabelStyle: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
        headerStyle: { backgroundColor: "#18012C" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontFamily: "Montserrat_700Bold", fontSize: 16, color: "#FFFFFF" },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
            <Feather name="log-out" size={20} color="#FFEB00" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="overview"
        options={{
          title: "Overview",
          tabBarIcon: ({ color }) => <Feather name="bar-chart-2" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="candidates"
        options={{
          title: "Candidates",
          tabBarIcon: ({ color }) => <Feather name="users" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color }) => <Feather name="grid" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => <Feather name="trending-up" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Feather name="settings" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
