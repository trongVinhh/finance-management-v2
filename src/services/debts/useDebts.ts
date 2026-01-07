// src/hooks/useDebts.ts
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export interface Debt {
  id: string;
  user_id: string;
  lender_name: string;
  amount: number;
  due_date: string;
  note?: string;
  status: "pending" | "paid" | "unpaid";
  created_at: string;
}

export const useDebts = () => {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDebts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addDebt = async (debt: Omit<Debt, "id" | "user_id" | "created_at">) => {

    const { data, error } = await supabase
      .from("debts")
      .insert([{ ...debt, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    setDebts((prev) => [data, ...prev]);
  };

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    const { data, error } = await supabase
      .from("debts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    setDebts((prev) => prev.map((d) => (d.id === id ? data : d)));
  };

  const deleteDebt = async (id: string) => {
    const { error } = await supabase.from("debts").delete().eq("id", id);
    if (error) throw error;
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  return { debts, loading, error, fetchDebts, addDebt, updateDebt, deleteDebt };
};
