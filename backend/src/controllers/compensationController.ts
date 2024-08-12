import { Request, Response } from "express";
import compensationService from "../services/compensationService";
import { ICompensation, ICompFormInput } from "../../../shared-types/types";
import { validateCompensationFormData } from "../validateCompForm/validateComp";
import { compFormSchema } from "../zodSchemas/compensationSchema";

interface SalaryFilter {
  page: number;
  rowsPerPage: number;
  sortDirection: "asc" | "desc";
  sortBy?: string;
}

const getAllSalaries = async (req: Request, res: Response) => {
  const salaryFilter: SalaryFilter = {
    page: 1,
    rowsPerPage: 10,
    sortDirection: "asc",
    sortBy: "",
  };
  if (typeof req.query.page === "string") {
    const pageNumber: number = parseInt(req.query.page, 10);
    const oneIndexedPageNumber: number = pageNumber - 1;
    salaryFilter.page = oneIndexedPageNumber;
  }
  if (typeof req.query.rowsPerPage === "string") {
    salaryFilter.rowsPerPage = parseInt(req.query.rowsPerPage, 10);
  }
  if (typeof req.query.sortDirection === "string") {
    if (
      req.query.sortDirection === "asc" ||
      req.query.sortDirection === "desc"
    ) {
      salaryFilter.sortDirection = req.query.sortDirection;
    }
  }
  if (typeof req.query.sortBy === "string" && req.query.sortBy !== "") {
    salaryFilter.sortBy = req.query.sortBy;
  }

  const compensationsWithPages = await compensationService.getAll(salaryFilter);
  return res.json(compensationsWithPages);
};

const addCompensation = async (req: Request, res: Response) => {
  const result = compFormSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const data = result.data;

  // Check if user is authenticated
  // const userId = (req as any).user?.id;

  // If user is not authenticated but provided an email, check if the email exists
  //   let userIdToUse = userId;
  //   if (!userId && data.email) {
  //     const existingUser = await userService.findByEmail(data.email);
  //     if (existingUser) {
  //       userIdToUse = existingUser.id;
  //     }
  //   }

  const compensationData: ICompensation = {
    salary_id: 0, // This will be set by the database
    company: data.company,
    title: data.title,
    type_of_practice: data.isSpecialist ? null : data.typeOfPractice!,
    is_specialist: data.isSpecialist,
    specialization: data.isSpecialist ? data.specialization! : null,
    is_new_grad: data.isNewGrad,
    years_of_experience: data.yearsOfExperience,
    location: data.location,
    base_salary: data.baseSalary,
    hourly_rate: data.hourlyRate,
    payment_frequency:
      data.paymentFrequency === "" ? null : data.paymentFrequency,
    sign_on_bonus: data.signOnBonus,
    average_annual_production: data.averageAnnualProduction,
    percent_production: data.percentProduction,
    total_compensation: null,
    gender: data.gender === "" ? null : data.gender,
    user_id: 1 || null,
    is_verified: false,
    is_approved: false,
    verification_document: null,
    verification_document_name: data.verificationDocumentName || null,
    days_worked_per_week: data.daysWorkedPerWeek,
    number_of_veterinarians: data.numberOfVeterinarians,
    email: data.email || null,
    created_at: new Date().toISOString(),
  };

  try {
    const newCompensation = await compensationService.create(compensationData);
    return res.status(201).json(newCompensation);
  } catch (error) {
    return res.status(500).json({
      message: "Unexpected server error, please try again later.",
    });
  }
};

export default { getAllSalaries, addCompensation };
