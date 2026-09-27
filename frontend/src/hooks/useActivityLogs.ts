import { useCallback, useEffect, useState } from "react";
import type { ActivityLog } from "../types/activityLog";

export const useActivityLog = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingActivityLog, setIsSavingActivityLog] = useState(false);

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
    createdAt: string,
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
            createdAt,
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
                createdAt,
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

    return details.replace(
      /Transaction date: ([^→]+) → ([^.\n]+)/,
      (_, oldDate, newDate) => {
        const formatDate = (dateString: string) => {
          const date = new Date(dateString.trim());

          if (Number.isNaN(date.getTime())) {
            return dateString.trim();
          }

          return date.toLocaleDateString("en-GB");
        };

        return `Transaction date: ${formatDate(oldDate)} → ${formatDate(newDate)}`;
      },
    );
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

    setEditActivityDate(new Date(log.createdAt));
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
