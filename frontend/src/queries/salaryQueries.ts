export const getAllSalaries = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/salaries`);
  if (!response.ok) {
    throw new Error("Failed to fetch salaries.");
  }
  const { salaries } = await response.json();
  return salaries;
};
