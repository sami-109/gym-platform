import useTransactions from "../../hooks/useTransactions";
import "./Transactions.scss";
import TransactionRow from "./TransactionRow";
import useMembershipPrices from "../../hooks/useMembershipPrices";
import { useState, useEffect } from "react";
import EditMembershipPrices from "./EditMembershipPrices";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import "react-datepicker/dist/react-datepicker.css";
import EditTransaction from "./EditTransaction";
import CustomDate from "../../components/Transactions/CustomDate";
import Loading from "../Loading/Loading";
function Transactions() {
  const {
    transactions,
    loading,
    error,
    deleteTransaction,
    updateTransaction,
    isDeleting,
  } = useTransactions();
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [dayPass, setDayPass] = useState("");
  const [trial, setTrial] = useState("");

  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [oneMonth, setOneMonth] = useState("");

  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [editAction, setEditAction] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [dateFilter, setDateFilter] = useState("1-day");
  const [customFromDate, setCustomFromDate] = useState<Date | null>(new Date());
  const [customToDate, setCustomToDate] = useState<Date | null>(new Date());
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [editTransactionDate, setEditTransactionDate] = useState<Date | null>(
    null,
  );
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null,
  );

  const {
    prices,
    setPrices,
    loading: pricesLoading,
    error: pricesError,
  } = useMembershipPrices();

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

      const startDate = new Date(customFromDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(customToDate);
      endDate.setHours(23, 59, 59, 999);

      return transactionDate >= startDate && transactionDate <= endDate;
    }

    return transactionDate >= startDate && transactionDate <= endDate;
  });

  const total = filteredTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amountPaid),
    0,
  );

  const applyCustomDate = () => {
    if (!customFromDate || !customToDate) {
      return;
    }

    setDateFilter("custom");
    setShowCustomDate(false);
  };

  const selectedTransaction =
    transactions.find(
      (transaction) => transaction.id === selectedTransactionId,
    ) ?? null;

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

  return (
    <section className="transactions">
      <div className="transactions-header">
        <h2>Transactions</h2>

        <div className="membership-prices">
          <div className="membership-prices-title">
            <h3>Membership Prices</h3>

            <button type="button" onClick={() => setShowPriceEditor(true)}>
              Edit
            </button>
          </div>

          {pricesError && <p>{pricesError}</p>}

          {prices && (
            <div className="membership-prices-list">
              <p>
                <strong>Day Pass:</strong> ${prices.dayPass}
              </p>

              <p>
                <strong>Trial:</strong> ${prices.trial}
              </p>

              <p>
                <strong>1 Month:</strong> ${prices.oneMonth}
              </p>
            </div>
          )}
        </div>
      </div>

      {loading || pricesLoading ? (
        <Loading message="Retrieving transaction data..." />
      ) : (
        <>
          {error && <p>{error}</p>}

          <div className="transaction-filters">
            <button
              type="button"
              className={dateFilter === "1-day" ? "active" : ""}
              onClick={() => setDateFilter("1-day")}
            >
              1 Day
            </button>

            <button
              type="button"
              className={dateFilter === "1-week" ? "active" : ""}
              onClick={() => setDateFilter("1-week")}
            >
              1 Week
            </button>

            <button
              type="button"
              className={dateFilter === "1-month" ? "active" : ""}
              onClick={() => setDateFilter("1-month")}
            >
              1 Month
            </button>

            <button
              type="button"
              className={dateFilter === "custom" ? "active" : ""}
              onClick={() => {
                setDateFilter("custom");
                setShowCustomDate(true);
              }}
            >
              Custom Date
            </button>
          </div>

          {!loading && !error && (
            <p>{filteredTransactions.length} transaction(s)</p>
          )}

          <div className="transactions-table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Action</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No transactions</td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      member={
                        transaction.member
                          ? `${transaction.member.firstName} ${transaction.member.lastName}`
                          : transaction.memberFirstName &&
                              transaction.memberLastName
                            ? `${transaction.memberFirstName} ${transaction.memberLastName}`
                            : "Deleted member"
                      }
                      action={
                        transaction.action === "trial"
                          ? "Trial"
                          : transaction.action === "day-pass"
                            ? "Day Pass"
                            : transaction.action === "1-month"
                              ? "1 Month"
                              : transaction.action
                      }
                      amount={Number(transaction.amountPaid)}
                      date={new Date(
                        transaction.transactionDate,
                      ).toLocaleDateString("en-GB")}
                      onEdit={() => openEditTransaction(transaction.id)}
                      onDelete={() => requestDeleteTransaction(transaction.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="transactions-total">
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>
        </>
      )}

      {showPriceEditor && prices && (
        <EditMembershipPrices
          dayPass={dayPass}
          trial={trial}
          oneMonth={oneMonth}
          onDayPassChange={setDayPass}
          onTrialChange={setTrial}
          onOneMonthChange={setOneMonth}
          onSave={updatePrices}
          isSaving={isSavingPrices}
          onClose={() => setShowPriceEditor(false)}
        />
      )}

      {transactionToDelete !== null && (
        <ConfirmModal
          title="Delete Transaction"
          memberName={
            transactions.find(
              (transaction) => transaction.id === transactionToDelete,
            )?.member
              ? `${
                  transactions.find(
                    (transaction) => transaction.id === transactionToDelete,
                  )?.member?.firstName
                } ${
                  transactions.find(
                    (transaction) => transaction.id === transactionToDelete,
                  )?.member?.lastName
                }`
              : "Deleted member"
          }
          memberId={transactionToDelete}
          message="Are you sure you want to delete this transaction? This action cannot be undone."
          isLoading={isDeleting}
          isLoadingMessage="Deleting transaction..."
          confirmLabel="Delete"
          onConfirm={confirmDeleteTransaction}
          onCancel={cancelDeleteTransaction}
        />
      )}
      {selectedTransaction && (
        <EditTransaction
          action={editAction}
          amountPaid={editAmount}
          transactionDate={editTransactionDate}
          isSaving={isSavingTransaction}
          onActionChange={setEditAction}
          onAmountPaidChange={setEditAmount}
          onTransactionDateChange={setEditTransactionDate}
          onSave={saveTransaction}
          onClose={closeEditTransaction}
        />
      )}

      {showCustomDate && (
        <CustomDate
          fromDate={customFromDate}
          toDate={customToDate}
          onFromDateChange={setCustomFromDate}
          onToDateChange={setCustomToDate}
          onApply={applyCustomDate}
          onClose={() => setShowCustomDate(false)}
        />
      )}
    </section>
  );
}

export default Transactions;
