import { useCallback, useEffect, useState } from "react";
import type { ActivityLog, ActivityFilter } from "../types/activityLog";

export const useActivityLog = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingActivityLog, setIsSavingActivityLog] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");

  const [deletingLog, setDeletingLog] = useState<ActivityLog | null>(null);

  const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);
  const [editDetails, setEditDetails] = useState("");
  const [editActivityDate, setEditActivityDate] = useState<Date | null>(null);

  const [dateFilter, setDateFilter] = useState("1-day");
  const [customFromDate, setCustomFromDate] = useState<Date | null>(new Date());
  const [customToDate, setCustomToDate] = useState<Date | null>(new Date());
  const [showCustomDate, setShowCustomDate] = useState(false);

  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/api/activity-logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to retrieve activity logs.");
      }

      setActivityLogs(data.activityLogs);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to retrieve activity logs.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteActivityLog = async (logId: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Authentication token is missing.");
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/activity-logs/${logId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete activity log.");
      }

      setActivityLogs((currentLogs) =>
        currentLogs.filter((log) => log.id !== logId),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete activity log.",
      );

      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const updateActivityLog = async (
    logId: number,
    details: string,
    activityDate: string,
  ) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Authentication token is missing.");
    }

    setIsSavingActivityLog(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/activity-logs/${logId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            details,
            activityDate,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update activity log.");
      }

      setActivityLogs((currentLogs) =>
        currentLogs.map((log) =>
          log.id === logId
            ? {
                ...log,
                details,
                activityDate,
              }
            : log,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update activity log.",
      );

      throw error;
    } finally {
      setIsSavingActivityLog(false);
    }
  };

  const formatActivityDetails = (details: string | null) => {
    if (!details) {
      return "";
    }

    let formattedDetails = details;

    // Add a line break after the transaction update sentence.
    formattedDetails = formattedDetails.replace(
      /^(Transaction #\d+ updated\.)\s*/,
      "$1\n",
    );

    // Put each transaction change on its own line.
    formattedDetails = formattedDetails.replace(
      /,\s*(Action:|Amount paid:|Transaction date:)/g,
      "\n$1",
    );

    // Format Action values.
    formattedDetails = formattedDetails.replace(
      /Action: (1-month|day-pass|trial) → (1-month|day-pass|trial)/,
      (_, oldAction, newAction) => {
        const formatAction = (action: string) => {
          switch (action) {
            case "1-month":
              return "1 Month";
            case "day-pass":
              return "Day Pass";
            case "trial":
              return "Trial";
            default:
              return action;
          }
        };

        return `Action: ${formatAction(oldAction)} → ${formatAction(newAction)}`;
      },
    );

    // Format amount values.
    formattedDetails = formattedDetails.replace(
      /Amount paid: ([\d.]+) → ([\d.]+)/,
      (_, oldAmount, newAmount) =>
        `Amount Paid: $${Number(oldAmount).toFixed(2)} → $${Number(newAmount).toFixed(2)}`,
    );

    // Format transaction dates.
    formattedDetails = formattedDetails.replace(
      /Transaction date: ([^→]+) → ([^.\n]+)/,
      (_, oldDate, newDate) => {
        const formatDate = (dateString: string) => {
          const date = new Date(dateString.trim());

          if (Number.isNaN(date.getTime())) {
            return dateString.trim();
          }

          return date.toLocaleDateString("en-GB");
        };

        return `Transaction Date: ${formatDate(oldDate)} → ${formatDate(newDate)}`;
      },
    );

    return formattedDetails;
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
      case "TRANSACTION_CREATED":
        return "Transaction Created";
      case "TRANSACTION_UPDATED":
        return "Transaction Updated";
      case "TRANSACTION_DELETED":
        return "Transaction Deleted";
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
      case "TRANSACTION_CREATED":
        return "Transaction created.";
      case "TRANSACTION_UPDATED":
        return "Transaction updated.";
      case "TRANSACTION_DELETED":
        return "Transaction deleted.";
      default:
        return "";
    }
  };

  const openEdit = (log: ActivityLog) => {
    setEditingLog(log);

    setEditDetails(
      log.details
        ? formatActivityDetails(log.details)
        : getActivityDetailsDisplay(log.action),
    );

    setEditActivityDate(new Date(log.activityDate));
  };

  const closeEdit = () => {
    setEditingLog(null);
    setEditDetails("");
    setEditActivityDate(null);
  };

  const openDelete = (log: ActivityLog) => {
    setDeletingLog(log);
  };

  const closeDelete = () => {
    if (isDeleting) {
      return;
    }

    setDeletingLog(null);
  };

  const handleEdit = async () => {
    if (!editingLog || !editActivityDate) {
      return;
    }

    try {
      await updateActivityLog(
        editingLog.id,
        editDetails,
        editActivityDate.toISOString(),
      );

      closeEdit();
    } catch (error) {
      console.error(error);
    }
  };

  const now = new Date();

  const filteredActivityLogs = activityLogs.filter((log) => {
    // Type filter
    if (activityFilter === "member" && log.transactionId !== null) {
      return false;
    }

    if (activityFilter === "transaction" && log.transactionId === null) {
      return false;
    }

    // Date filter
    const activityDate = new Date(log.activityDate);

    if (dateFilter === "1-day") {
      const startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);

      if (!(activityDate >= startDate && activityDate <= now)) {
        return false;
      }
    }

    if (dateFilter === "1-week") {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);

      if (!(activityDate >= startDate && activityDate <= now)) {
        return false;
      }
    }

    if (dateFilter === "1-month") {
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);

      if (!(activityDate >= startDate && activityDate <= now)) {
        return false;
      }
    }

    if (dateFilter === "custom") {
      if (!customFromDate || !customToDate) {
        return false;
      }

      const startDate = new Date(customFromDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(customToDate);
      endDate.setHours(23, 59, 59, 999);

      if (!(activityDate >= startDate && activityDate <= endDate)) {
        return false;
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      const memberName = log.member
        ? `${log.member.firstName} ${log.member.lastName}`
        : `${log.memberFirstName ?? ""} ${log.memberLastName ?? ""}`;

      const performedByName = log.performedBy
        ? `${log.performedBy.firstName} ${log.performedBy.lastName}`
        : "";

      const activity = getActivityActionDisplay(log.action);

      const details = log.details ?? "";

      const transactionNumber = log.transaction
        ? String(log.transaction.transactionNumber)
        : "";

      const searchableText = [
        memberName,
        performedByName,
        activity,
        details,
        transactionNumber,
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
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

  const openCustomDate = () => {
    setDateFilter("custom");
    setShowCustomDate(true);
  };

  const closeCustomDate = () => {
    setShowCustomDate(false);
  };

  const handleDelete = async () => {
    if (!deletingLog) {
      return;
    }

    try {
      await deleteActivityLog(deletingLog.id);
      closeDelete();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  return {
    filteredActivityLogs,

    loading,
    error,

    deletingLog,
    editingLog,

    editDetails,
    editActivityDate,

    dateFilter,
    customFromDate,
    customToDate,
    showCustomDate,

    searchQuery,
    setSearchQuery,

    activityFilter,
    setActivityFilter,

    showTypeFilter,
    setShowTypeFilter,

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
  };
};
