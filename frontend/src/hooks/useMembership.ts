import { useEffect, useState } from "react";
import type { Membership } from "../types/membership";

function useMembership(
  userId: number | undefined,
  userRole: string | undefined,
) {
  const [membership, setMembership] = useState<Membership | null>(null);

  useEffect(() => {
    if (!userId || userRole !== "MEMBER") {
      return;
    }

    const fetchMembership = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/members/me/membership",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setMembership(data.membership);
      } catch (error) {}
    };

    fetchMembership();
  }, [userId, userRole]);

  return { membership };
}

export default useMembership;
