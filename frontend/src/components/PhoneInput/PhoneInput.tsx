type PhoneInputProps = {
  phone: string;
  onPhoneChange: (value: string) => void;
};

function PhoneInput({ phone, onPhoneChange }: PhoneInputProps) {
  const isLebanon = phone.startsWith("961");

  const countryCode = isLebanon ? "961" : "Other";
  const localNumber = isLebanon ? phone.slice(3) : phone;

  const formatLebanonNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 5) {
      return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  };

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === "961") {
      onPhoneChange("961");
    } else {
      onPhoneChange("");
    }
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "");

    if (countryCode === "961") {
      onPhoneChange(`961${digits.slice(0, 8)}`);
    } else {
      onPhoneChange(digits);
    }
  };

  return (
    <label>
      Phone
      <div className="phone-input">
        <select value={countryCode} onChange={handleCountryChange}>
          <option value="961">961</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="text"
          value={
            countryCode === "961"
              ? formatLebanonNumber(localNumber)
              : localNumber
          }
          onChange={handleNumberChange}
          inputMode="numeric"
        />
      </div>
    </label>
  );
}

export default PhoneInput;
