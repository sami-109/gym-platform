import { useCallback, useEffect, useState } from "react";

export type ActivityLog = {
  id: number;
  memberId: number | null;
  memberFirstName: string | null;
  memberLastName: string | null;
  gymId: number | null;
  performedByUserId: number | null;
  action: string;
  details: string | null;
  createdAt: string;

  member: {
    firstName: string;
    lastName: string;
  } | null;

  performedBy: {
    firstName: string;
    lastName: string;
    username: string;
  } | null;
};

export const useActivityLogs = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

    if (!token) return;

    setIsDeleting(true);

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
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  return {
    activityLogs,
    loading,
    error,
    fetchActivityLogs,
    setActivityLogs,
    deleteActivityLog,
    isDeleting,
  };
};
