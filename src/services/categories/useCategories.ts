import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getDefaultCategories } from "../../utils/system-constants";
import type { Category } from "./entities/category.entity";

export const useCategories = (userId?: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const initCategories = async (userId: string) => {
    const defaultCategories = getDefaultCategories(userId);
    return await supabase.from("categories").insert(defaultCategories);
  };

  const fetchCategories = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", uid);

    if (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      // Nếu chưa có thì tạo default
      await initCategories(uid);
      const { data: defaults } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", uid);
      setCategories(defaults || []);
    } else {
      setCategories(data);
    }

    setLoading(false);
  };

  const addCategory = async (values: Omit<Category, "id" | "user_id">) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("categories")
      .insert([{ ...values, user_id: userId }])
      .select()
      .single();

    if (!error && data) {
      setCategories((prev) => [...prev, data as Category]);
    }
    return { data, error };
  };

  const updateCategory = async (id: string, values: Partial<Category>) => {
    const { data, error } = await supabase
      .from("categories")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, ...values } : cat))
      );
    }
    return { data, error };
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (!error) {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
    return { error };
  };

  useEffect(() => {
    if (userId) {
      fetchCategories(userId);
    }
  }, [userId]);

  return {
    categories,
    setCategories,
    loading,
    refetch: () => userId && fetchCategories(userId),
    initCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};
