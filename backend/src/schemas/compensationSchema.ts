import { z } from "zod";

const cleanString = (val: string) => val.replace(/[^0-9.]+/g, "");

const numberFromCurrency = (schema: z.ZodNumber) =>
  z
    .string()
    .transform((val) => (val === "" ? null : cleanString(val)))
    .refine((val) => val === null || !isNaN(Number(val)), {
      message: "Invalid number format",
    })
    .transform((val) => (val === null ? null : schema.parse(Number(val))))
    .nullable();

const numberFromPercent = (schema: z.ZodNumber) =>
  z
    .string()
    .transform((val) => (val === "" ? null : cleanString(val)))
    .refine((val) => val === null || !isNaN(Number(val)), {
      message: "Invalid number format",
    })
    .transform((val) => (val === null ? null : schema.parse(Number(val))))
    .nullable();

export const CompFormSchema = z.object({
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  title: z.string().min(1, "Title is required"),
  isSpecialist: z.boolean(),
  specialization: z.string().optional(),
  typeOfPractice: z.string().optional(),
  isNewGrad: z.boolean(),
  yearsOfExperience: z.coerce
    .number()
    .int()
    .nonnegative("Years of experience must be a non-negative integer"),
  baseSalary: numberFromCurrency(
    z.number().nonnegative("Base salary must be non-negative")
  ),
  hourlyRate: numberFromCurrency(
    z.number().nonnegative("Hourly rate must be non-negative")
  ),
  paymentFrequency: z
    .enum(["Annually", "Hourly"])
    .transform((val) => val.toLowerCase() as "annually" | "hourly")
    .refine((val) => val === "annually" || val === "hourly", {
      message: "Payment frequency is required.",
    }),
  signOnBonus: numberFromCurrency(
    z.number().nonnegative("Sign-on bonus must be non-negative")
  ),
  averageAnnualProduction: numberFromCurrency(
    z.number().nonnegative("Average annual production must be non-negative")
  ),
  percentProduction: numberFromPercent(
    z
      .number()
      .min(0, "Percent production must be at least 0")
      .max(100, "Percent production cannot exceed 100")
  ),
  gender: z
    .enum(["male", "female", "non-binary", ""])
    .transform((val) => (val === "" ? null : val)),
  numberOfVeterinarians: z
    .union([
      z.string().transform((val) => (val === "" ? null : Number(val))),
      z.number(),
    ])
    .refine(
      (val) => val === null || (Number.isInteger(val) && val > 0),
      "Number of veterinarians must be a positive integer"
    )
    .nullable(),
  verificationDocument: z.array(z.instanceof(Blob)).nullable(),
  verificationDocumentName: z.string().optional(),
  daysWorkedPerWeek: z
    .union([
      z.string().transform((val) => (val === "" ? null : Number(val))),
      z.number(),
    ])
    .refine(
      (val) => val === null || (Number.isFinite(val) && val >= 0 && val <= 7),
      "Days worked per week must be between 0 and 7"
    )
    .nullable(),
  email: z.union([z.string().email(), z.literal("")]).nullable(),
});

export type ICompFormInput = z.infer<typeof CompFormSchema>;
