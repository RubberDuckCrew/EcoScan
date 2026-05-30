export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const checkDate = new Date(date);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const checkDay = new Date(
    checkDate.getFullYear(),
    checkDate.getMonth(),
    checkDate.getDate(),
  );

  const timeFormatter = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeString = timeFormatter.format(checkDate);
  const diffMs = now.getTime() - checkDate.getTime();

  if (checkDay.getTime() === today.getTime()) {
    if (diffMs < 60 * 1000) {
      return "gerade eben";
    }
    if (diffMs < 60 * 60 * 1000) {
      const mins = Math.floor(diffMs / (60 * 1000));
      return mins === 1 ? `vor 1 Minute` : `vor ${mins} Minuten`;
    }
    return `Heute, ${timeString}`;
  } else if (checkDay.getTime() === yesterday.getTime()) {
    return `Gestern, ${timeString}`;
  } else {
    const dateFormatter = new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return dateFormatter.format(checkDate);
  }
}
