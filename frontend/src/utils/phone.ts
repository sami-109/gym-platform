export function formatPhone(phone: string) {
  if (phone.startsWith("961") && phone.length === 11) {
    const localNumber = phone.slice(3);

    return `${localNumber.slice(0, 2)} ${localNumber.slice(
      2,
      5,
    )} ${localNumber.slice(5)}`;
  }

  return phone;
}
