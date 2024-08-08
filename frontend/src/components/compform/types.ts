export interface ICompFormInput {
  company: string;
  title: string;
  typeOfPractice: string;
  isSpecialist: boolean;
  specialization: string;
  isNewGrad: boolean;
  yearsOfExperience: number;
  location: string;
  baseSalary: number;
  hourlyRate: number;
  paymentFrequency: string;
  averageAnnualBonus: number;
  signOnBonus: number;
  averageAnnualProduction: number;
  percentProduction: number;
  totalCompensation: number;
  gender: "male" | "female" | "non-binary" | "";
  numberOfVeterinarians: number;
  isVerified: boolean;
  isApproved: boolean;
  verificationDocument: Blob[] | null;
  verificationDocumentName: string | undefined;
  daysWorkedPerWeek: number;
  email: string | null;
}
