export const formatPhoneNumber = (phoneNumber: string) => {
  const digits = phoneNumber.replace(/\D/g, "").slice(0, 10);

  if (digits.length !== 10) {
    return phoneNumber;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};
