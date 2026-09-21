import { useEffect, useState } from "react";
import type { Member } from "../types/member";

function useMembers(userRole: string | undefined) {
  const [members, setMembers] = useState<Member[]>([]);

  const fetchMembers = async () => {
    if (userRole !== "ADMIN") {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
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
    } catch (error) {}
  };

  useEffect(() => {
    fetchMembers();
  }, [userRole]);

  return {
    members,
    setMembers,
  };
}

export default useMembers;
