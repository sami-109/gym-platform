import { useActivityLog } from "../../hooks/useActivityLogs";
import "./ActivityLog.scss";
import "../../styles/_modal.scss";
import CustomDate from "../CustomDate/CustomDate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import Loading from "../Loading/Loading";

const ActivityLog = () => {
  const {
    filteredActivityLogs,
    loading,
    error,

    showTypeFilter,
    setShowTypeFilter,

    activityFilter,
    setActivityFilter,

    searchQuery,
    setSearchQuery,

    deletingLog,
    editingLog,

    editDetails,
    editActivityDate,

    dateFilter,
    customFromDate,
    customToDate,
    showCustomDate,

    isDeleting,
    isSavingActivityLog,

    setEditDetails,
    setEditActivityDate,

    setDateFilter,
    setCustomFromDate,
    setCustomToDate,

    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
    handleEdit,
    applyCustomDate,

    getActivityActionDisplay,

    openCustomDate,
    closeCustomDate,
    handleDelete,
  } = useActivityLog();

  return (
    <div className="activity-log">
      <div className="activity-log-header">
        <h2>Activity Log</h2>

        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search activities, members, transaction #..."
        />
      </div>

      <div className="activity-log-filters">
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
          {filteredActivityLogs.length}{" "}
          {filteredActivityLogs.length === 1 ? "activity" : "activities"}
        </p>
      )}

      {loading ? (
        <Loading message="Retrieving activity log data..." />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>
                <div className="activity-type-header">
                  <span>Type</span>

                  <button
                    type="button"
                    className="filter-arrow"
                    onClick={() => setShowTypeFilter(!showTypeFilter)}
                  >
                    ▾
                  </button>

                  {showTypeFilter && (
                    <div className="activity-type-dropdown">
                      <button
                        type="button"
                        onClick={() => {
                          setActivityFilter("all");
                          setShowTypeFilter(false);
                        }}
                      >
                        All Activity
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActivityFilter("member");
                          setShowTypeFilter(false);
                        }}
                      >
                        Membership
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActivityFilter("transaction");
                          setShowTypeFilter(false);
                        }}
                      >
                        Transaction
                      </button>
                    </div>
                  )}
                </div>
              </th>
              <th>Activity</th>
              <th>Performed By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredActivityLogs.length === 0 ? (
              <tr>
                <td colSpan={6}>No activity logs</td>
              </tr>
            ) : (
              filteredActivityLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    {log.member
                      ? `${log.member.firstName} ${log.member.lastName}`
                      : log.memberFirstName && log.memberLastName
                        ? `${log.memberFirstName} ${log.memberLastName}`
                        : "Deleted member"}
                  </td>

                  <td>
                    {log.transactionId !== null ? "Transaction" : "Membership"}
                  </td>

                  <td>{getActivityActionDisplay(log.action)}</td>

                  <td>
                    {log.performedBy
                      ? `${log.performedBy.firstName} ${log.performedBy.lastName}`
                      : "Deleted user"}
                  </td>

                  <td>
                    {new Date(log.activityDate).toLocaleDateString("en-GB")}
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button type="button" onClick={() => openEdit(log)}>
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => openDelete(log)}
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
      )}

      {editingLog && (
        <div className="modal-backdrop">
          <section className="activity-log-modal">
            {isSavingActivityLog ? (
              <Loading message="Applying changes..." />
            ) : (
              <>
                <button
                  type="button"
                  className="modal-close"
                  onClick={closeEdit}
                >
                  ×
                </button>

                <div className="modal-header">
                  <h2>Edit Activity Log</h2>

                  {editingLog.transaction && (
                    <p>
                      Transaction #{editingLog.transaction.transactionNumber}
                    </p>
                  )}

                  <p>
                    {editingLog.member
                      ? `${editingLog.member.firstName} ${editingLog.member.lastName}`
                      : editingLog.memberFirstName && editingLog.memberLastName
                        ? `${editingLog.memberFirstName} ${editingLog.memberLastName}`
                        : "Deleted member"}
                  </p>
                </div>

                <div className="form-section">
                  <label>
                    Action
                    <input
                      type="text"
                      value={getActivityActionDisplay(editingLog.action)}
                      disabled
                    />
                  </label>

                  <label>
                    Created At
                    <input
                      type="text"
                      value={new Date(editingLog.createdAt).toLocaleString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )}
                      disabled
                    />
                  </label>

                  <label>
                    ActivityDate
                    <DatePicker
                      selected={editActivityDate}
                      onChange={(date: Date | null) =>
                        setEditActivityDate(date)
                      }
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select date"
                    />
                  </label>

                  <label>
                    Details
                    <textarea
                      value={editDetails}
                      onChange={(event) => setEditDetails(event.target.value)}
                    />
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={closeEdit}>
                    Close
                  </button>

                  <button type="button" onClick={handleEdit}>
                    Apply Changes
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
      {deletingLog && (
        <ConfirmModal
          title="Delete Activity Log"
          memberName={
            deletingLog.member
              ? `${deletingLog.member.firstName} ${deletingLog.member.lastName}`
              : deletingLog.memberFirstName && deletingLog.memberLastName
                ? `${deletingLog.memberFirstName} ${deletingLog.memberLastName}`
                : "Deleted member"
          }
          memberId={deletingLog.id}
          message="Are you sure you want to delete this activity log?"
          isLoading={isDeleting}
          isLoadingMessage="Deleting activity log..."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={closeDelete}
        />
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
    </div>
  );
};

export default ActivityLog;
