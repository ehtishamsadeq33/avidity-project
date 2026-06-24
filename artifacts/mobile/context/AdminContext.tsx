import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "cra_admin_token";
const USERNAME_KEY = "cra_admin_username";

interface AdminCtx {
  token: string | null;
  username: string | null;
  isLoading: boolean;
  login: (token: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AdminCtx | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USERNAME_KEY),
        ]);
        setToken(t);
        setUsername(u);
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (t: string, u: string) => {
    await AsyncStorage.multiSet([[TOKEN_KEY, t], [USERNAME_KEY, u]]);
    setToken(t);
    setUsername(u);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USERNAME_KEY]);
    setToken(null);
    setUsername(null);
  }, []);

  const value = useMemo<AdminCtx>(
    () => ({ token, username, isLoading, login, logout }),
    [token, username, isLoading, login, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
