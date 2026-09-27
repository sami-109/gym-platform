import { useEffect, useState } from "react";
import type { Member } from "../types/member";

function useMembers(userRole: string | undefined) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async (showLoading = true) => {
    if (userRole !== "ADMIN") {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await fetch("http://localhost:3000/api/members/view", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setMembers(data.members);
    } catch (error) {
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [userRole]);

  return {
    members,
    setMembers,
    fetchMembers,
    loading,
  };
}

export default useMembers;
