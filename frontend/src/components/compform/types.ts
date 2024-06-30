export interface ICompFormInput {
  company: string;
  title: string;
  typeOfPractice: string;
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
  gender: string;
  numberOfVeterinarians: number;
  userId: number;
  isVerified: boolean;
  isApproved: boolean;
  verificationDocument: Blob[];
  verificationDocumentName: string;
}
