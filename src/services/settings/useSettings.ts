// src/hooks/useSettings.ts
import { supabase } from "../../lib/supabase";

export const useSettings = () => {
  const initSettings = async (userId: string) => {
    return await supabase.from("settings").insert({
      user_id: userId,
      currency: "VND",
      language: "vi",
      timezone: "Asia/Ho_Chi_Minh",
    });
  };


  return { initSettings };
};
