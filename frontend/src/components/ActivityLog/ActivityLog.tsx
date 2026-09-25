import { useState } from "react";
import {
  useActivityLogs,
  type ActivityLog as ActivityLogType,
} from "../../hooks/useActivityLogs";
import "./ActivityLog.scss";
import "../../styles/_modal.scss";
import CustomDate from "../../components/Transactions/CustomDate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import Loading from "../Loading/Loading";

const ActivityLog = () => {
  const {
    activityLogs,
    loading,
    error,
    setActivityLogs,
    deleteActivityLog,
    isDeleting,
  } = useActivityLogs();
  const [deletingLog, setDeletingLog] = useState<ActivityLogType | null>(null);
  const [editActivityDate, setEditActivityDate] = useState<Date | null>(null);
  const [isSavingActivityLog, setIsSavingActivityLog] = useState(false);

  const [dateFilter, setDateFilter] = useState("1-day");
  const [customFromDate, setCustomFromDate] = useState<Date | null>(new Date());
  const [customToDate, setCustomToDate] = useState<Date | null>(new Date());
  const [showCustomDate, setShowCustomDate] = useState(false);

  const [editingLog, setEditingLog] = useState<ActivityLogType | null>(null);
  const [editDetails, setEditDetails] = useState("");

  const openEdit = (log: ActivityLogType) => {
    setEditingLog(log);
    setEditDetails(log.details || getActivityDetailsDisplay(log.action));
    setEditActivityDate(new Date(log.createdAt));
  };

  const closeEdit = () => {
    setEditingLog(null);
    setEditDetails("");
    setEditActivityDate(null);
  };

  const openDelete = (log: ActivityLogType) => {
    setDeletingLog(log);
  };

  const closeDelete = () => {
    if (isDeleting) {
      return;
    }

    setDeletingLog(null);
  };

  const getActivityActionDisplay = (action: string) => {
    switch (action) {
      case "1-month":
        return "1 Month Membership Registration";
      case "day-pass":
        return "Day Pass Registration";
      case "trial":
        return "Trial Registration";

      case "RENEWED":
        return "1 Month Membership Renewal";
      case "DEACTIVATED":
        return "Deactivated Membership";
      case "ACTIVATED":
        return "Activated Membership";
      case "FROZEN":
        return "Froze Membership";
      case "RESUMED":
        return "Resumed Membership";
      case "DATES_ADJUSTED":
        return "Membership Dates Adjusted";
      case "MEMBER_UPDATED":
        return "Member Information Updated";
      case "MEMBER_CREATED":
        return "Member Created";
      case "CREDENTIALS_RETRIEVED":
        return "Credentials Retrieved";
      case "MEMBER_DELETED":
        return "Member Deleted";
      case "DAY_PASS":
        return "Day Pass";

      default:
        return action;
    }
  };

  const getActivityDetailsDisplay = (action: string) => {
    switch (action) {
      case "1-month":
        return "1 Month membership registered.";
      case "day-pass":
        return "Day pass registered.";
      case "trial":
        return "Trial membership registered.";

      case "RENEWED":
        return "Membership renewed.";
      case "DEACTIVATED":
        return "Member deactivated.";
      case "ACTIVATED":
        return "Member activated.";
      case "FROZEN":
        return "Membership frozen.";
      case "RESUMED":
        return "Membership resumed.";
      case "DATES_ADJUSTED":
        return "Membership dates adjusted.";
      case "MEMBER_UPDATED":
        return "Member information updated.";
      case "MEMBER_CREATED":
        return "Member created.";
      case "CREDENTIALS_RETRIEVED":
        return "Member credentials retrieved.";
      case "MEMBER_DELETED":
        return "Member deleted.";
      case "DAY_PASS":
        return "Day pass added.";

      default:
        return "";
    }
  };

  const handleEdit = async () => {
    if (!editingLog) {
      return;
    }

    setIsSavingActivityLog(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/activity-logs/${editingLog.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            details: editDetails,
            createdAt: editActivityDate?.toISOString(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update activity log.");
      }

      setActivityLogs((logs) =>
        logs.map((log) =>
          log.id === editingLog.id
            ? {
                ...log,
                details: editDetails,
                createdAt: editActivityDate!.toISOString(),
              }
            : log,
        ),
      );

      closeEdit();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingActivityLog(false);
    }
  };

  const now = new Date();

  const filteredActivityLogs = activityLogs.filter((log) => {
    const activityDate = new Date(log.createdAt);

    if (dateFilter === "1-day") {
      const startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);

      return activityDate >= startDate && activityDate <= now;
    }

    if (dateFilter === "1-week") {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);

      return activityDate >= startDate && activityDate <= now;
    }

    if (dateFilter === "1-month") {
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);

      return activityDate >= startDate && activityDate <= now;
    }

    if (dateFilter === "custom") {
      if (!customFromDate || !customToDate) {
        return false;
      }

      const startDate = new Date(customFromDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(customToDate);
      endDate.setHours(23, 59, 59, 999);

      return activityDate >= startDate && activityDate <= endDate;
    }

    return true;
  });

  const applyCustomDate = () => {
    if (!customFromDate || !customToDate) {
      return;
    }

    setDateFilter("custom");
    setShowCustomDate(false);
  };

  return (
    <div className="activity-log">
      <div className="activity-log-header">
        <h2>Activity Log</h2>
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
          onClick={() => {
            setDateFilter("custom");
            setShowCustomDate(true);
          }}
        >
          Custom Date
        </button>
      </div>

      {!loading && !error && (
        <p>{filteredActivityLogs.length} activity log(s)</p>
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
              <th>Action</th>
              <th>Performed By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredActivityLogs.length === 0 ? (
              <tr>
                <td colSpan={5}>No activity logs</td>
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

                  <td>{getActivityActionDisplay(log.action)}</td>

                  <td>
                    {log.performedBy
                      ? `${log.performedBy.firstName} ${log.performedBy.lastName}`
                      : "Deleted user"}
                  </td>

                  <td>{new Date(log.createdAt).toLocaleDateString("en-GB")}</td>

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
                    Details
                    <textarea
                      value={editDetails}
                      onChange={(event) => setEditDetails(event.target.value)}
                    />
                  </label>

                  <label>
                    Date
                    <DatePicker
                      selected={editActivityDate}
                      onChange={(date: Date | null) =>
                        setEditActivityDate(date)
                      }
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select date"
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
          onConfirm={async () => {
            try {
              await deleteActivityLog(deletingLog.id);
              setDeletingLog(null);
            } catch (error) {
              console.error(error);
            }
          }}
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
          onClose={() => setShowCustomDate(false)}
        />
      )}
    </div>
  );
};

export default ActivityLog;
