import { Request, Response } from "express";
import compensationService from "../services/compensationService";
import { z } from "zod";
import { CompFormSchema, ICompFormInput } from "../schemas/compensationSchema";
import userService from "../services/userService";
import multer from "multer";
import { SalaryFilter } from "../types";
import { db } from "../db/connection";
import b2Service from "../services/b2Service";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/httpErrors";

const getAllSalaries = asyncHandler(async (req: Request, res: Response) => {
  const salaryFilter: SalaryFilter = {
    page: 0,
    rowsPerPage: 10,
    sortDirection: "asc",
    sortBy: "",
    specialistsOnly: false,
    isAdminQuery: false,
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

  if (
    req.query.companySearch !== "" &&
    typeof req.query.companySearch === "string"
  ) {
    salaryFilter.companySearch = req.query.companySearch;
  }
  if (
    req.query.locationSearch !== "" &&
    typeof req.query.locationSearch === "string"
  ) {
    salaryFilter.locationSearch = req.query.locationSearch;
  }

  if (req.query.specialistsOnly === "true") {
    salaryFilter.specialistsOnly = true;
  }
  if (typeof req.query.practiceType === "string") {
    salaryFilter.practiceTypeFilter = req.query.practiceType
      .split(",")
      .map((type) => type.trim());
  }

  const compensationsWithPages = await compensationService.getAll(
    db,
    salaryFilter
  );
  res.json(compensationsWithPages);
});

const getAllAdminCompensations = asyncHandler(
  async (req: Request, res: Response) => {
    const salaryFilter: SalaryFilter = {
      page: 0,
      rowsPerPage: 10,
      sortDirection: "asc",
      sortBy: "",
      specialistsOnly: false,
      isAdminQuery: true,
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
      if (!user.is_admin) {
        throw new ForbiddenError("Access denied");
      }
    } else {
      throw new UnauthorizedError("Unauthorized");
    }

    const compensationsWithPages = await compensationService.getAll(
      db,
      salaryFilter
    );
    res.json(compensationsWithPages);
  }
);

const upload = multer().single("verificationDocument");

const createCompensation = asyncHandler(async (req: Request, res: Response) => {
  await new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        reject(
          new BadRequestError(
            "Invalid file. Please use .pdf, .doc, or .docx file types only"
          )
        );
      } else {
        resolve(null);
      }
    });
  });

  const parsedData: ICompFormInput = JSON.parse(req.body.newCompensation);

  if (req.file) {
    parsedData.verificationDocument = req.file;
  }

  const validatedData = CompFormSchema.parse(parsedData);

  let userId: string | null = null;
  if (req.session && req.session.userId) {
    userId = req.session.userId;
  } else if (validatedData.email) {
    const existingUser = await userService.findByEmail(db, validatedData.email);
    if (existingUser) {
      throw new ConflictError("Invalid email or password.");
    } else {
      const userIdObj = await userService.createWithNullPassword(
        db,
        validatedData.email
      );
      userId = userIdObj.id;
    }
  }

  let verificationDocumentKey: string | undefined = undefined;
  let needsReview: boolean = false;
  if (req.file) {
    verificationDocumentKey = await b2Service.uploadFileToB2(
      req.file.buffer,
      req.file.originalname
    );
    needsReview = true;
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
    needs_review: needsReview,
  };

  const insertedComp = await compensationService.create(db, compensationData);

  res.status(201).json({
    insertedComp,
    message:
      "Success! Thank you for submitting your comp info. It will be reviewed as soon as possible.",
  });
});

const compIdSchema = z.object({ compId: z.string().uuid() });

const approveCompensationById = asyncHandler(
  async (req: Request, res: Response) => {
    const { compId } = compIdSchema.parse({ compId: req.params.id });

    const updatedComp = await compensationService.approveById(db, compId);
    if (!updatedComp) {
      throw new NotFoundError(`Compensation with id ${compId} not found`);
    }
    res
      .status(200)
      .json({ message: `Success: compensation ${compId} approved.` });
  }
);

const verifyCompensationById = asyncHandler(
  async (req: Request, res: Response) => {
    const { compId } = compIdSchema.parse({ compId: req.params.id });
    const updatedComp = await compensationService.verifyById(db, compId);
    if (!updatedComp) {
      throw new NotFoundError(`Compensation with id ${compId} not found`);
    }

    res
      .status(200)
      .json({ message: `Success: compensation ${compId} verified.` });
  }
);

const deleteCompensationById = asyncHandler(
  async (req: Request, res: Response) => {
    const { compId } = compIdSchema.parse({ compId: req.params.id });
    const deletedComp = await compensationService.deleteById(db, compId);
    if (!deletedComp) {
      throw new NotFoundError(`Compensation with id ${compId} not found`);
    }

    res
      .status(200)
      .json({ message: `Success: compensation ${compId} deleted.` });
  }
);

const getProfileCompensations = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    if (!userId) {
      throw new UnauthorizedError("Please login before viewing profile.");
    }

    const userCompensations = await userService.getCompsByUserId(db, userId);
    res.status(200).json(userCompensations || []);
  }
);

const uploadVerificationDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const compIdSchema = z.string().uuid();

    await new Promise<void>((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          reject(
            new BadRequestError(
              "Invalid file. Please use .pdf, .doc, or .docx file types only"
            )
          );
        } else {
          resolve();
        }
      });
    });

    const compId: string = compIdSchema.parse(req.params.compId);

    if (!req.file) {
      throw new BadRequestError("Invalid file, please try again.");
    }

    const verificationDocumentKey = await b2Service.uploadFileToB2(
      req.file.buffer,
      req.file.originalname
    );

    if (!verificationDocumentKey) {
      throw new InternalServerError("Failed to upload verification document");
    }

    const updatedCompensation =
      await compensationService.uploadVerificationDocument(
        db,
        compId,
        verificationDocumentKey,
        req.file.originalname
      );

    if (!updatedCompensation) {
      throw new NotFoundError(`Compensation with id ${compId} not found`);
    }

    res.status(200).json({
      message:
        "Verification document uploaded successfully. It will be reviewed as soon as possible.",
      data: updatedCompensation,
    });
  }
);

export default {
  getAllSalaries,
  createCompensation,
  getAllAdminCompensations,
  approveCompensationById,
  verifyCompensationById,
  deleteCompensationById,
  getProfileCompensations,
  uploadVerificationDocument,
};
