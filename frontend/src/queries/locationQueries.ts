export const getLocationSuggestions = async (
  query: string
): Promise<string[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/locations?q=${query}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch locations.");
  }
  const suggestions = await response.json();
  return suggestions;
};
