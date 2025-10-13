// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { useInitDefaults } from "../hooks/useInitDefault";
import { useNotify } from "./NotifycationContext";

type AuthContextType = {
  user: any;
  session: any;
  loading: boolean;
  userSettings: any;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  getUser: () => any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<any>(null);
  const { initDefaults } = useInitDefaults();
  const notify = useNotify();

  // Lấy session ban đầu
  useEffect(() => {
    const loginTime = parseInt(localStorage.getItem("login_time") || "0", 10);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (loginTime && now - loginTime > fiveMinutes) {
      notify('error', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      logout();
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        await fetchUserSettings(session.user.id);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchUserSettings(session.user.id);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserSettings = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setUserSettings(data);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      localStorage.setItem("user_id", data.user.id);
      localStorage.setItem("login_time", Date.now().toString());
      setUser(data.user);
      await fetchUserSettings(data.user.id);
    }
  };

  const signup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      await initDefaults(data.user.id);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`, // URL xử lý sau khi người dùng nhấn link trong email
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserSettings(null);
  };

  const getUser = () => user;

  const value: AuthContextType = {
    user,
    session,
    loading,
    userSettings,
    login,
    signup,
    resetPassword,
    logout,
    getUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
