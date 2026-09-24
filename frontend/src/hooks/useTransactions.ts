import { useEffect, useState } from "react";

export type Transaction = {
  id: number;
  memberId: number | null;
  gymId: number;
  performedByUserId: number | null;
  action: string;
  transactionDate: string;
  startDate: string | null;
  endDate: string | null;
  amountPaid: string;
  profit: string;
  details: string | null;
  createdAt: string;
  member: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
};

function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch("http://localhost:3000/api/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch transactions.");
        }

        setTransactions(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch transactions.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const deleteTransaction = async (transactionId: number) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const response = await fetch(
      `http://localhost:3000/api/transactions/${transactionId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete transaction.");
    }

    setTransactions((currentTransactions) =>
      currentTransactions.filter(
        (transaction) => transaction.id !== transactionId,
      ),
    );
  };

  const updateTransaction = async (
    transactionId: number,
    action: string,
    amountPaid: number,
    transactionDate: Date,
  ) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const response = await fetch(
      `http://localhost:3000/api/transactions/${transactionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          amountPaid,
          transactionDate,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update transaction.");
    }

    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        transaction.id === transactionId ? data : transaction,
      ),
    );
  };

  return {
    transactions,
    loading,
    error,
    deleteTransaction,
    updateTransaction,
  };
}

export default useTransactions;
