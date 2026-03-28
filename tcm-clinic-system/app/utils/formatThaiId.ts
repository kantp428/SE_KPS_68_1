export const formatThaiId = (thaiId: string) => {
  const digits = thaiId.replace(/\D/g, "").slice(0, 13);

  if (digits.length !== 13) {
    return thaiId;
  }

  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`;
};
