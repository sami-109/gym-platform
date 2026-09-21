export const getMembershipTimeRemaining = (
  expiryDate: string,
  currentTime: number,
) => {
  const remainingMilliseconds = new Date(expiryDate).getTime() - currentTime;

  if (remainingMilliseconds <= 0) {
    return "Membership expired";
  }

  const totalMinutes = Math.floor(remainingMilliseconds / (1000 * 60));

  const days = Math.floor(totalMinutes / (60 * 24));

  if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"} remaining`;
  }

  const hours = Math.floor(totalMinutes / 60);

  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} remaining`;
  }

  const minutes = totalMinutes;

  return `${minutes} ${minutes === 1 ? "minute" : "minutes"} remaining`;
};

export const getDaysRemaining = (
  membership: {
    status: string;
    expiryDate: string | null;
    frozenRemainingSeconds: number | null;
  },
  currentTime: number,
) => {
  if (membership.status === "EXPIRED") {
    return 0;
  }

  if (membership.status === "FROZEN") {
    if (!membership.frozenRemainingSeconds) {
      return 0;
    }

    return Math.floor(membership.frozenRemainingSeconds / (60 * 60 * 24));
  }

  if (!membership.expiryDate) {
    return 0;
  }

  const remainingMilliseconds =
    new Date(membership.expiryDate).getTime() - currentTime;

  if (remainingMilliseconds <= 0) {
    return 0;
  }

  return Math.floor(remainingMilliseconds / (1000 * 60 * 60 * 24));
};

export const getMembershipDisplay = (
  membership: {
    status: string;
    expiryDate: string | null;
  },
  currentTime: number,
) => {
  if (membership.status === "FROZEN") {
    return "Membership Frozen";
  }

  if (!membership.expiryDate) {
    return "Membership expired";
  }

  return getMembershipTimeRemaining(membership.expiryDate, currentTime);
};

export const formatDate = (date: string | null) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-GB");
};
