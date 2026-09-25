import { useEffect, useState } from "react";

export type MembershipPrices = {
  dayPass: string;
  trial: string;
  oneMonth: string;
};

function useMembershipPrices() {
  const [prices, setPrices] = useState<MembershipPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrices = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:3000/api/membership-prices",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch membership prices.");
        }

        setPrices(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch membership prices.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return {
    prices,
    loading,
    error,
    setPrices,
  };
}

export default useMembershipPrices;
