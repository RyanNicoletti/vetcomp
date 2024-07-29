export const moneyFormatter = new Intl.NumberFormat("default", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

export const formatNullableMoneyValue = (value: number | null | undefined) => {
  return value != null ? moneyFormatter.format(value) : "--";
};
