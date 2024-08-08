export interface ICompFormInput {
  company: string;
  title: string;
  typeOfPractice?: string;
  isSpecialist: boolean;
  specialization?: string;
  isNewGrad: boolean;
  yearsOfExperience: string;
  location: string;
  baseSalary?: string;
  hourlyRate?: string;
  paymentFrequency: string;
  signOnBonus?: string;
  averageAnnualProduction?: string;
  percentProduction?: string;
  gender: "male" | "female" | "non-binary" | "";
  numberOfVeterinarians: string;
  isVerified: boolean;
  isApproved: boolean;
  verificationDocument: Blob[] | null;
  verificationDocumentName?: string;
  daysWorkedPerWeek?: string;
  email?: string;
}
