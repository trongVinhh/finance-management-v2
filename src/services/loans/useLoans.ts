// src/hooks/useLoans.ts
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export interface Loan {
  id: string;
  user_id: string;
  borrower_name: string;
  amount: number;
  due_date: string;
  note?: string;
  status: "pending" | "paid";
  created_at: string;
}

export const useLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addLoan = async (loan: Omit<Loan, "id" | "user_id" | "created_at">) => {

    const { data, error } = await supabase
      .from("loans")
      .insert([{ ...loan, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    setLoans((prev) => [data, ...prev]);
  };

  const updateLoan = async (id: string, updates: Partial<Loan>) => {
    const { data, error } = await supabase
      .from("loans")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    setLoans((prev) => prev.map((l) => (l.id === id ? data : l)));
  };

  const deleteLoan = async (id: string) => {
    const { error } = await supabase.from("loans").delete().eq("id", id);
    if (error) throw error;
    setLoans((prev) => prev.filter((l) => l.id !== id));
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  return { loans, loading, error, fetchLoans, addLoan, updateLoan, deleteLoan };
};
