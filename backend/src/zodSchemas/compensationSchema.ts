import { z } from "zod";

const ZodStringNumberOrNull = z
  .string()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine((value) => value === null || !isNaN(Number(value)), {
    message: "Invalid number",
  })
  .transform((value) => (value === null ? null : Number(value)));

const ZodRequiredNumber = z
  .string()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || !isNaN(Number(value)), {
    message: "This field is required and must be a valid number",
  })
  .transform((value) => Number(value));

const ZodCurrencyStringNumber = z
  .string()
  .transform((value) => value.replace(/[^0-9.]+/g, ""))
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine((value) => value === null || !isNaN(Number(value)), {
    message: "Invalid number",
  })
  .transform((value) => (value === null ? null : Number(value)));

const compFormSchema = z.object({
  company: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Title is required"),
  typeOfPractice: z.string().optional(),
  isSpecialist: z.boolean(),
  specialization: z.string().optional(),
  isNewGrad: z.boolean(),
  yearsOfExperience: ZodRequiredNumber,
  location: z.string().min(1, "Location is required"),
  baseSalary: ZodCurrencyStringNumber,
  hourlyRate: ZodCurrencyStringNumber,
  paymentFrequency: z
    .string()
    .transform((value) => value.toLowerCase())
    .pipe(z.enum(["annually", "hourly", ""])),
  signOnBonus: ZodCurrencyStringNumber,
  averageAnnualProduction: ZodCurrencyStringNumber,
  percentProduction: ZodStringNumberOrNull,
  gender: z.enum(["male", "female", "non-binary", ""]),
  numberOfVeterinarians: ZodStringNumberOrNull,
  verificationDocument: z.instanceof(Blob).array().nullable(),
  verificationDocumentName: z.string().optional(),
  daysWorkedPerWeek: ZodStringNumberOrNull,
  email: z.union([z.literal(""), z.string().email()]),
});

export type ICompFormInput = z.infer<typeof compFormSchema>;

export { compFormSchema };
