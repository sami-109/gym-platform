export const getMembershipTypeDisplay = (membershipType: string) => {
  return (
    {
      "1-month": "1 Month",
      trial: "Trial",
      "day-pass": "Day Pass",
    }[membershipType] || membershipType
  );
};
