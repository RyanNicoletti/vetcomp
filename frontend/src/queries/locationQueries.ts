export const getLocationSuggestions = async (
  query: string
): Promise<string[]> => {
  const response = await fetch(`/api/locations?q=${query}`);
  if (!response.ok) {
    throw new Error("Failed to fetch locations.");
  }
  const suggestions = await response.json();
  return suggestions;
};
