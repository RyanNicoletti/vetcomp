export const moneyFormatter = new Intl.NumberFormat("default", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

export const formatNullableMoneyValue = (value: number | null | undefined) => {
  return value != null ? moneyFormatter.format(value) : "--";
};

export const formatMoneyAbbreviated = (value: number): string => {
  if (value == null) return "n/a";

  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }

  return moneyFormatter.format(value);
};

export const convertCurrencyToNumber = (value: string | number): number => {
  if (typeof value === "number") return value;
  return Number(value.replace(/[^0-9.-]+/g, ""));
};
