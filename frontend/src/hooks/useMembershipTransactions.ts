import { useEffect, useState } from "react";
import type {
  MembershipPriceState,
  Transaction,
  TransactionDateFilter,
} from "../types/membershipTransactions";

function useMembershipTransactions() {
  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Date filtering
  const [dateFilter, setDateFilter] = useState<TransactionDateFilter>("1-day");

  const [customFromDate, setCustomFromDate] = useState<Date | null>(new Date());
  const [customToDate, setCustomToDate] = useState<Date | null>(new Date());
  const [showCustomDate, setShowCustomDate] = useState(false);

  const [prices, setPrices] = useState<MembershipPriceState | null>(null);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [pricesError, setPricesError] = useState("");

  // Membership price editing
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [dayPass, setDayPass] = useState("");
  const [trial, setTrial] = useState("");
  const [oneMonth, setOneMonth] = useState("");
  const [isSavingPrices, setIsSavingPrices] = useState(false);

  // Transaction editing
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [editAction, setEditAction] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editTransactionDate, setEditTransactionDate] = useState<Date | null>(
    null,
  );
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);

  // Transaction deletion
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null,
  );

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

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

  useEffect(() => {
    const fetchPrices = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setPricesLoading(false);
        return;
      }

      setPricesLoading(true);
      setPricesError("");

      try {
        const response = await fetch(
          "http://localhost:3000/api/membership-prices",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch membership prices.");
        }

        setPrices(data);
      } catch (error) {
        setPricesError(
          error instanceof Error
            ? error.message
            : "Failed to fetch membership prices.",
        );
      } finally {
        setPricesLoading(false);
      }
    };

    fetchPrices();
  }, []);

  useEffect(() => {
    if (!prices) {
      return;
    }

    setDayPass(prices.dayPass);
    setTrial(prices.trial);
    setOneMonth(prices.oneMonth);
  }, [prices]);

  const updatePrices = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    setIsSavingPrices(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/membership-prices",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dayPass: Number(dayPass),
            trial: Number(trial),
            oneMonth: Number(oneMonth),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update membership prices.");
      }

      setPrices(data);
      setShowPriceEditor(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingPrices(false);
    }
  };

  const requestDeleteTransaction = (transactionId: number) => {
    setTransactionToDelete(transactionId);
  };

  const cancelDeleteTransaction = () => {
    setTransactionToDelete(null);
  };

  const confirmDeleteTransaction = async () => {
    if (transactionToDelete === null) {
      return;
    }

    try {
      await deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  const openEditTransaction = (transactionId: number) => {
    const transaction = transactions.find(
      (transaction) => transaction.id === transactionId,
    );

    if (!transaction) {
      return;
    }

    setSelectedTransactionId(transaction.id);
    setEditAction(transaction.action);
    setEditAmount(transaction.amountPaid);
    setEditTransactionDate(new Date(transaction.transactionDate));
  };

  const closeEditTransaction = () => {
    setSelectedTransactionId(null);
    setEditAction("");
    setEditAmount("");
    setEditTransactionDate(null);
  };

  const saveTransaction = async () => {
    if (selectedTransactionId === null || editTransactionDate === null) {
      return;
    }

    setIsSavingTransaction(true);

    try {
      await updateTransaction(
        selectedTransactionId,
        editAction,
        Number(editAmount),
        editTransactionDate,
      );

      closeEditTransaction();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingTransaction(false);
    }
  };

  // Delete transaction
  const deleteTransaction = async (transactionId: number) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    setIsDeleting(true);

    try {
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
    } finally {
      setIsDeleting(false);
    }
  };

  // Update transaction
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

  // Filter transactions
  const now = new Date();

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.transactionDate);

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);

    if (dateFilter === "1-week") {
      startDate.setDate(startDate.getDate() - 7);
    }

    if (dateFilter === "1-month") {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    if (dateFilter === "custom") {
      if (!customFromDate || !customToDate) {
        return false;
      }

      const customStartDate = new Date(customFromDate);
      customStartDate.setHours(0, 0, 0, 0);

      const customEndDate = new Date(customToDate);
      customEndDate.setHours(23, 59, 59, 999);

      return (
        transactionDate >= customStartDate && transactionDate <= customEndDate
      );
    }

    return transactionDate >= startDate && transactionDate <= endDate;
  });

  // Total
  const total = filteredTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amountPaid),
    0,
  );

  // Custom date modal
  const openCustomDate = () => {
    setShowCustomDate(true);
  };

  const closeCustomDate = () => {
    setShowCustomDate(false);
  };

  const applyCustomDate = () => {
    if (!customFromDate || !customToDate) {
      return;
    }

    setDateFilter("custom");
    setShowCustomDate(false);
  };

  const openPriceEditor = () => {
    setShowPriceEditor(true);
  };

  const closePriceEditor = () => {
    setShowPriceEditor(false);
  };

  const selectedTransaction =
    transactions.find(
      (transaction) => transaction.id === selectedTransactionId,
    ) ?? null;

  return {
    transactions,
    loading,
    error,
    deleteTransaction,
    updateTransaction,
    isDeleting,

    openPriceEditor,
    closePriceEditor,

    filteredTransactions,
    total,

    dateFilter,
    customFromDate,
    customToDate,
    showCustomDate,

    setDateFilter,
    setCustomFromDate,
    setCustomToDate,

    openCustomDate,
    closeCustomDate,
    applyCustomDate,

    prices,
    setPrices,
    pricesLoading,
    pricesError,

    showPriceEditor,
    dayPass,
    trial,
    oneMonth,
    isSavingPrices,

    selectedTransactionId,
    editAction,
    editAmount,
    editTransactionDate,
    isSavingTransaction,

    transactionToDelete,

    setShowPriceEditor,
    setDayPass,
    setTrial,
    setOneMonth,

    setEditAction,
    setEditAmount,
    setEditTransactionDate,

    setTransactionToDelete,

    updatePrices,

    requestDeleteTransaction,
    cancelDeleteTransaction,
    confirmDeleteTransaction,

    openEditTransaction,
    closeEditTransaction,
    saveTransaction,

    selectedTransaction,
  };
}

export default useMembershipTransactions;
