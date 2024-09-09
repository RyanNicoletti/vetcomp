import { Request, Response } from "express";
import compensationService from "../services/compensationService";
import { z } from "zod";
import { CompFormSchema, ICompFormInput } from "../schemas/compensationSchema";
import userService from "../services/userService";
import multer from "multer";
import { SalaryFilter } from "../types";
import { db } from "../db/connection";
import b2Service from "../services/b2Service";

const getAllSalaries = async (req: Request, res: Response) => {
  const salaryFilter: SalaryFilter = {
    page: 0,
    rowsPerPage: 10,
    sortDirection: "asc",
    sortBy: "",
    getApprovedCompensations: true,
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

  try {
    const compensationsWithPages = await compensationService.getAll(
      db,
      salaryFilter
    );
    return res.json(compensationsWithPages);
  } catch (error) {
    console.error("Error fetching salaries:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching salaries" });
  }
};

const getAllAdminCompensations = async (req: Request, res: Response) => {
  const salaryFilter: SalaryFilter = {
    page: 0,
    rowsPerPage: 10,
    sortDirection: "asc",
    sortBy: "",
    getApprovedCompensations: true,
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

  if (req.session && req.session.userId) {
    const user = await userService.getById(db, req.session.userId);
    if (user.is_admin) {
      salaryFilter.getApprovedCompensations = false;
    }
  }

  try {
    const compensationsWithPages = await compensationService.getAll(
      db,
      salaryFilter
    );
    return res.json(compensationsWithPages);
  } catch (error) {
    console.error("Error fetching salaries:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching salaries" });
  }
};

const upload = multer().single("verificationDocument");

const createCompensation = async (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Error uploading file.",
        errors: [
          {
            field: "verificationDocument",
            message:
              "Invalid file. Please use .pdf, .doc, or .docx file types only",
          },
        ],
      });
    }

    try {
      const parsedData: ICompFormInput = JSON.parse(req.body.newCompensation);

      if (req.file) {
        parsedData.verificationDocument = req.file;
      }

      const validatedData = CompFormSchema.parse(parsedData);

      let userId: string | null = null;
      if (req.session && req.session.userId) {
        userId = req.session.userId;
      } else if (validatedData.email) {
        const existingUser = await userService.findByEmail(
          db,
          validatedData.email
        );
        if (existingUser) {
          return res.status(409).json({
            message: "Invalid email address.",
            errors: [
              {
                field: "email",
                message:
                  "Email already exists: please login if it belongs to you, or choose different email address",
              },
            ],
          });
        } else {
          const userIdObj = await userService.createWithNullPassword(
            db,
            validatedData.email
          );
          userId = userIdObj.id;
        }
      }

      let verificationDocumentKey: string | undefined = undefined;
      if (req.file) {
        verificationDocumentKey = await b2Service.uploadFileToB2(
          req.file.buffer,
          req.file.originalname
        );
      }

      const compensationData = {
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
        verification_document_url: undefined,
        verification_document_name: verificationDocumentKey,
      };

      const insertedComp = await compensationService.create(
        db,
        compensationData
      );
      return res.status(201).json({
        insertedComp,
        message:
          "Success! Thank you for submitting your comp info. It will be reviewed as soon as possible.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({ errors: formattedErrors });
      }
      console.error("Unexpected error in compensation controller", error);
      return res.status(500).json({
        message: "An unexpected error occurred, please try again later.",
        errors: error,
      });
    }
  });
};

const approveCompensationById = (req: Request, res: Response) => {
  const compIdSchema = z.object({ compId: z.string().uuid() });
  try {
    const { compId } = compIdSchema.parse({ compId: req.params.id });
    if (!compId) {
      return res.status(404).json({
        message: `Compensation with id ${compId} not found`,
      });
    }
    compensationService.approveById(db, compId);
    return res
      .status(200)
      .json({ message: `Success: compensation ${compId} approved.` });
  } catch (err) {
    return res.status(500).json({
      message: `Error approving compensation: ${req.params.id}`,
      errors: err,
    });
  }
};

const verifyCompensationById = (req: Request, res: Response) => {
  const compIdSchema = z.object({ compId: z.string().uuid() });
  try {
    const { compId } = compIdSchema.parse({ compId: req.params.id });
    if (!compId) {
      return res
        .status(404)
        .json({ message: `Compensation with id ${compId} not found` });
    }
    compensationService.verifyById(db, compId);
    return res
      .status(200)
      .json({ message: `Success: compensation ${compId} verified.` });
  } catch (err) {
    return res.status(500).json({
      message: `Error verifying compensation: ${req.params.id}`,
      errors: err,
    });
  }
};

const deleteCompensationById = (req: Request, res: Response) => {
  const compIdSchema = z.object({ compId: z.string().uuid() });
  try {
    const { compId } = compIdSchema.parse({ compId: req.params.id });
    if (!compId) {
      return res
        .status(404)
        .json({ message: `Compensation with id ${compId} not found` });
    }
    compensationService.deleteById(db, compId);
    return res
      .status(200)
      .json({ message: `Success: compensation ${compId} deleted.` });
  } catch (err) {
    return res.status(500).json({
      message: `Error deleting compensation: ${req.params.id}`,
      errors: err,
    });
  }
};

const getProfileCompensations = () => {};

export default {
  getAllSalaries,
  createCompensation,
  getAllAdminCompensations,
  approveCompensationById,
  verifyCompensationById,
  deleteCompensationById,
  getProfileCompensations,
};
