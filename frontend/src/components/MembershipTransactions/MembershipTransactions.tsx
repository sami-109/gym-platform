import DatePicker from "react-datepicker";
import useMembershipTransactions from "../../hooks/useMembershipTransactions";
import CustomDate from "../CustomDate/CustomDate";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import Loading from "../Loading/Loading";
import "react-datepicker/dist/react-datepicker.css";
import "./MembershipTransactions.scss";

function MembershipTransactions() {
  const {
    transactions,
    loading,
    error,
    isDeleting,

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

    openPriceEditor,
    closePriceEditor,

    prices,
    pricesLoading,
    pricesError,

    showPriceEditor,
    dayPass,
    trial,
    oneMonth,
    isSavingPrices,

    editAction,
    editAmount,
    editTransactionDate,
    isSavingTransaction,

    transactionToDelete,

    setDayPass,
    setTrial,
    setOneMonth,

    setEditAction,
    setEditAmount,
    setEditTransactionDate,

    updatePrices,

    requestDeleteTransaction,
    cancelDeleteTransaction,
    confirmDeleteTransaction,

    openEditTransaction,
    closeEditTransaction,
    saveTransaction,

    selectedTransaction,
  } = useMembershipTransactions();

  return (
    <section className="transactions">
      <div className="transactions-header">
        <h2>Membership Transactions</h2>

        <div className="membership-prices">
          <div className="membership-prices-title">
            <h3>Membership Prices</h3>

            <button type="button" onClick={openPriceEditor}>
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
              onClick={openCustomDate}
            >
              Custom Date
            </button>
          </div>

          {!loading && !error && (
            <p>
              {filteredTransactions.length}{" "}
              {filteredTransactions.length === 1
                ? "Transaction"
                : "Transactions"}
            </p>
          )}

          <div className="transactions-table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>ID</th>
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
                    <td colSpan={6}>No transactions</td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.transactionNumber}</td>

                      <td>
                        {transaction.member
                          ? `${transaction.member.firstName} ${transaction.member.lastName}`
                          : transaction.memberFirstName &&
                              transaction.memberLastName
                            ? `${transaction.memberFirstName} ${transaction.memberLastName}`
                            : "Deleted member"}
                      </td>

                      <td>
                        {transaction.action === "trial"
                          ? "Trial"
                          : transaction.action === "day-pass"
                            ? "Day Pass"
                            : transaction.action === "1-month"
                              ? "1 Month"
                              : transaction.action}
                      </td>

                      <td>${Number(transaction.amountPaid).toFixed(2)}</td>

                      <td>
                        {new Date(
                          transaction.transactionDate,
                        ).toLocaleDateString("en-GB")}
                      </td>

                      <td>
                        <div className="transaction-actions">
                          <button
                            type="button"
                            onClick={() => openEditTransaction(transaction.id)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              requestDeleteTransaction(transaction.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
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
        <div className="modal-backdrop">
          <section className="edit-membership-prices">
            {isSavingPrices ? (
              <Loading message="Saving membership prices..." />
            ) : (
              <>
                <button
                  type="button"
                  className="modal-close"
                  onClick={closePriceEditor}
                >
                  ×
                </button>

                <div className="modal-header">
                  <h2>Edit Membership Prices</h2>
                </div>

                <div className="price-fields">
                  <label>
                    Day Pass
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={dayPass}
                      onChange={(event) => setDayPass(event.target.value)}
                    />
                  </label>

                  <label>
                    Trial
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={trial}
                      onChange={(event) => setTrial(event.target.value)}
                    />
                  </label>

                  <label>
                    1 Month
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={oneMonth}
                      onChange={(event) => setOneMonth(event.target.value)}
                    />
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={closePriceEditor}>
                    Cancel
                  </button>

                  <button type="button" onClick={updatePrices}>
                    Save
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
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
        <div className="modal-backdrop">
          <section className="edit-transaction">
            {isSavingTransaction ? (
              <Loading message="Saving transaction..." />
            ) : (
              <>
                <button
                  type="button"
                  className="modal-close"
                  onClick={closeEditTransaction}
                >
                  ×
                </button>

                <div className="modal-header">
                  <h2>Edit Transaction</h2>
                </div>

                <div className="transaction-edit-fields">
                  <label>
                    Action
                    <select
                      value={editAction}
                      onChange={(event) => setEditAction(event.target.value)}
                    >
                      <option value="1-month">1 Month</option>
                      <option value="trial">Trial</option>
                      <option value="day-pass">Day Pass</option>
                    </select>
                  </label>

                  <label>
                    Amount
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editAmount}
                      onChange={(event) => setEditAmount(event.target.value)}
                    />
                  </label>

                  <label>
                    Transaction Date
                    <DatePicker
                      selected={editTransactionDate}
                      onChange={(date: Date | null) =>
                        setEditTransactionDate(date)
                      }
                      dateFormat="dd/MM/yyyy"
                    />
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={closeEditTransaction}>
                    Cancel
                  </button>

                  <button type="button" onClick={saveTransaction}>
                    Save
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {showCustomDate && (
        <CustomDate
          fromDate={customFromDate}
          toDate={customToDate}
          onFromDateChange={setCustomFromDate}
          onToDateChange={setCustomToDate}
          onApply={applyCustomDate}
          onClose={closeCustomDate}
        />
      )}
    </section>
  );
}

export default MembershipTransactions;
