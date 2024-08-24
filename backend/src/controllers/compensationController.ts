import { Request, Response } from "express";
import compensationService from "../services/compensationService";
import { ICompensation } from "../../../shared-types/types";
import { z } from "zod";
import { CompFormSchema, ICompFormInput } from "../schemas/compensationSchema";
import userService from "../services/userService";

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

const createCompensation = async (req: Request, res: Response) => {
  try {
    const validatedData: ICompFormInput = CompFormSchema.parse(req.body);

    let userId;
    if (req.session && req.session.userId) {
      userId = req.session.userId;
    } else if (validatedData.email) {
      const existingUser = await userService.findByEmail(validatedData.email);
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const userIdObj = await userService.createWithNullPassword(
          validatedData.email
        );
        userId = userIdObj.id;
      }
    }

    let verificationDocumentKey: string | null = null;
    if (validatedData.verificationDocument) {
      const fileBuffer = Buffer.from(
        await validatedData.verificationDocument[0].arrayBuffer()
      );
      verificationDocumentKey = await compensationService.uploadFileToB2(
        fileBuffer,
        validatedData.verificationDocumentName || "unnamed_file"
      );
    }

    const compensationData: ICompensation = {
      company: validatedData.company,
      location: validatedData.location,
      title: validatedData.title,
      is_specialist: validatedData.isSpecialist,
      specialization: validatedData.specialization || null,
      type_of_practice: validatedData.typeOfPractice || null,
      is_new_grad: validatedData.isNewGrad,
      years_of_experience: validatedData.yearsOfExperience,
      base_salary: validatedData.baseSalary,
      hourly_rate: validatedData.hourlyRate,
      payment_frequency: validatedData.paymentFrequency,
      sign_on_bonus: validatedData.signOnBonus,
      average_annual_production: validatedData.averageAnnualProduction,
      percent_production: validatedData.percentProduction,
      total_compensation: null,
      gender: validatedData.gender,
      number_of_veterinarians: validatedData.numberOfVeterinarians,
      days_worked_per_week: validatedData.daysWorkedPerWeek,
      email: validatedData.email || null,
      user_id: userId,
      is_verified: false,
      is_approved: false,
      verification_document_url: verificationDocumentKey || null,
      verification_document_name:
        validatedData.verificationDocumentName || null,
    };

    const insertedComp = await compensationService.create(compensationData);
    return res.status(201).json({
      insertedComp,
      message:
        "Success! Thank you for submitting your comp info. It will be reviewed as soon as possible.",
    });
  } catch (error) {
    // TODO: if  user was created, delete it by id
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({ errors: formattedErrors });
    } else if (error instanceof Error) {
      return res.status(500).json({
        message: "An unexpected error occurred. Please try again later.",
        error: error.message,
      });
    }
    return res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

export default { getAllSalaries, createCompensation };
