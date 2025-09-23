export function sinceTime(timestamp: number): string {
  const date = new Date(timestamp);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "2-digit"
  };

  const formatted = date.toLocaleDateString("en-US", options);

  return formatted;
}