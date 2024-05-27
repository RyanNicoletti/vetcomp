export const formatCityLabel = (city: any) => {
  const { name, country, state } = city;
  if (country === "US") {
    return `${name}, ${state}`;
  }
  return `${name}, ${country}`;
};
