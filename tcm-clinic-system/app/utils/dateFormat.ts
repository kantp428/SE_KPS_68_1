export const toHHmm = (date: Date) =>
  date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const toDate = (date: Date) => date.toISOString().slice(0, 10);
