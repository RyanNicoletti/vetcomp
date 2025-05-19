import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} from "../errors/httpErrors";
import { db } from "../db/connection";
import multer from "multer";
import b2Service from "../services/b2Service";
import emailService from "../services/emailService";
import { JobApplicationFormSchema } from "../schemas/jobApplicationSchema";
import jobApplicationsService from "../services/jobApplicationsService";
import jobsService from "../services/jobsService";
import { b2Client } from "../../config/b2Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const upload = multer().single("resume");

const jobApplicationsController = {
  submitApplication: asyncHandler(async (req: Request, res: Response) => {
    const jobId = req.params.jobId;

    if (!req.session.userId) {
      throw new UnauthorizedError("Must be logged in to apply for jobs");
    }

    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          reject(new BadRequestError("Invalid file upload"));
        }
        resolve(null);
      });
    });

    const job = await jobsService.getById(db, jobId);
    if (!job) {
      throw new NotFoundError("Job not found");
    }

    // If it's an external application URL, this endpoint shouldn't be called
    if (job.application_method === "external") {
      throw new BadRequestError("This job requires external application");
    }

    const formData = {
      fullName: req.body.fullName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    };

    const validatedData = JobApplicationFormSchema.parse(formData);

    let resumeKey: string | undefined;
    let resumeOriginalName: string | undefined;

    if (req.file) {
      const uploadResult = await b2Service.uploadFileToB2(
        req.file.buffer,
        req.file.originalname,
        "resume",
        req.session.userId
      );

      if (uploadResult) {
        resumeKey = uploadResult.key;
        resumeOriginalName = uploadResult.originalName;
      }
    }

    const application = await jobApplicationsService.create(db, {
      job_id: jobId,
      user_id: req.session.userId,
      full_name: validatedData.fullName,
      email: validatedData.email,
      phone_number: validatedData.phoneNumber ?? null,
      resume_name: resumeKey,
      resume_original_name: resumeOriginalName,
      status: "applied",
    });

    // Send confirmation email to applicant
    await emailService.sendApplicationConfirmationEmail({
      to: validatedData.email,
      jobTitle: job.title,
      companyName: job.company,
      applicantName: validatedData.fullName,
    });

    // Send notification email to job poster
    await emailService.sendApplicationNotificationEmail({
      to: job.contact_email!,
      jobTitle: job.title,
      applicantName: validatedData.fullName,
      applicantEmail: validatedData.email,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      data: application,
    });
  }),

  getApplicationsForJob: asyncHandler(async (req: Request, res: Response) => {
    const jobId = req.params.jobId;

    if (!req.session.userId) {
      throw new UnauthorizedError("Must be logged in to view applications");
    }

    // Verify the user owns this job post
    const job = await jobsService.getById(db, jobId);
    if (!job || job.user_id !== req.session.userId) {
      throw new NotFoundError("Job not found or access denied");
    }

    const applications = await jobApplicationsService.getApplicationsByJobId(
      db,
      jobId
    );
    res.json(applications);
  }),

  getUserApplications: asyncHandler(async (req: Request, res: Response) => {
    if (!req.session.userId) {
      throw new UnauthorizedError("Must be logged in to view applications");
    }

    const applications = await jobApplicationsService.getApplicationsByUserId(
      db,
      req.session.userId
    );
    res.json(applications);
  }),

  updateApplicationStatus: asyncHandler(async (req: Request, res: Response) => {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!req.session.userId) {
      throw new UnauthorizedError(
        "Must be logged in to update application status"
      );
    }

    // Get the application and joined job information to verify ownership
    const applicationWithJob = await db("job_applications")
      .join("jobs", "job_applications.job_id", "jobs.id")
      .where({ "job_applications.id": applicationId })
      .select("job_applications.*", "jobs.user_id as job_owner_id")
      .first();

    if (!applicationWithJob) {
      throw new NotFoundError("Application not found");
    }

    if (applicationWithJob.job_owner_id !== req.session.userId) {
      throw new UnauthorizedError("Not authorized to update this application");
    }

    const updatedApplication =
      await jobApplicationsService.updateApplicationStatus(
        db,
        applicationId,
        status
      );

    res.json(updatedApplication);
  }),

  deleteApplication: asyncHandler(async (req: Request, res: Response) => {
    const { applicationId } = req.params;

    if (!req.session.userId) {
      throw new UnauthorizedError("Must be logged in to delete applications");
    }

    const deleted = await jobApplicationsService.deleteApplication(
      db,
      applicationId,
      req.session.userId
    );

    if (!deleted) {
      throw new NotFoundError("Application not found or access denied");
    }

    res.json({ message: "Application deleted successfully" });
  }),

  downloadResume: asyncHandler(async (req: Request, res: Response) => {
    const { resumeId } = req.params;

    if (!req.session.userId) {
      throw new UnauthorizedError("Must be logged in to download resumes");
    }

    const application = await db("job_applications")
      .where({ resume_name: resumeId })
      .first();

    if (!application) {
      throw new NotFoundError("Resume not found");
    }

    const job = await jobsService.getById(db, application.job_id);
    if (!job) {
      throw new NotFoundError("Job not found");
    }

    const isJobPoster = job.user_id === req.session.userId;
    const isApplicant = application.user_id === req.session.userId;

    if (!isJobPoster && !isApplicant) {
      throw new UnauthorizedError("Not authorized to download this resume");
    }

    try {
      const command = new GetObjectCommand({
        Bucket: process.env.B2_RESUME_BUCKET_NAME,
        Key: resumeId,
      });

      const data = await b2Client.send(command);

      const downloadFilename = application.resume_original_name || resumeId;

      // Set the headers for file download
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${downloadFilename}"`
      );
      if (data.ContentType) {
        res.setHeader("Content-Type", data.ContentType);
      }

      // Stream the file to the client
      if (data.Body) {
        // @ts-ignore - TypeScript doesn't recognize the pipe method on this type
        data.Body.pipe(res);
      } else {
        throw new Error("Empty file body");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      throw new InternalServerError("Error downloading file");
    }
  }),
};

export default jobApplicationsController;
