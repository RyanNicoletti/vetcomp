export const moneyFormatter = new Intl.NumberFormat("default", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});
