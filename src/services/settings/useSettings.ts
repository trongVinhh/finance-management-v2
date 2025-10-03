// src/hooks/useSettings.ts
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface UserSettings {
  id?: string;
  user_id: string;
  default_account_id: string;
  currency: string;
  created_at?: string;
  updated_at?: string;
  allocations: {
    accountId: string;
    amount: number;
  }[];
}

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setSettings(data);
    } catch (error: any) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (
    data: Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const settingsData: Partial<UserSettings> = {
        user_id: user.id,
        default_account_id: data.default_account_id,
        currency: data.currency,
        updated_at: new Date().toISOString(),
        allocations: data.allocations,
      };

      const { data: existingSettings } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", user.id)
        .single();

      let savedData;
      let error;

      if (existingSettings) {
        // Update nếu đã tồn tại
        const result = await supabase
          .from("user_settings")
          .update(settingsData)
          .eq("user_id", user.id)
          .select()
          .single();

        savedData = result.data;
        error = result.error;
      } else {
        // Insert nếu chưa tồn tại
        const result = await supabase
          .from("user_settings")
          .insert({
            user_id: user.id,
            ...settingsData,
          })
          .select()
          .single();

        savedData = result.data;
        error = result.error;
      }

      if (error) throw error;

      setSettings(savedData);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const initSettings = async (userId: string) => {
    return await supabase.from("user_settings").insert({
      user_id: userId,
      currency: "VND",
    });
  };

  return {
    settings,
    loading,
    saving,
    loadSettings,
    saveSettings,
    initSettings,
  };
};
