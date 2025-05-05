export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(`${dateString}T00:00:00Z`);

    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid Date";
  }
};
