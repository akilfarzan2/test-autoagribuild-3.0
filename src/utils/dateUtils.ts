// Helper function to get current Adelaide time in datetime-local format
export const getAdelaideDateTimeForInput = (): string => {
  const now = new Date();
  // Adelaide is UTC+9:30 (or UTC+10:30 during daylight saving)
  // For simplicity, we'll use UTC+9:30 as requested
  const adelaideOffset = 9.5 * 60; // 9.5 hours in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const adelaideTime = new Date(utc + (adelaideOffset * 60000));
  
  // Format as YYYY-MM-DDTHH:mm for datetime-local input
  const year = adelaideTime.getFullYear();
  const month = String(adelaideTime.getMonth() + 1).padStart(2, '0');
  const day = String(adelaideTime.getDate()).padStart(2, '0');
  const hours = String(adelaideTime.getHours()).padStart(2, '0');
  const minutes = String(adelaideTime.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};