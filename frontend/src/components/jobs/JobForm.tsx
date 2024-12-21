// src/components/jobs/JobForm.tsx

import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Alert,
} from "@mui/material";
import { JobFormData } from "./types/jobTypes";
import { createJob } from "../../queries/jobQueries";
import { useUserStatus } from "../../hooks/useUserStatus";
import "./JobForm.css";

const JobForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStatus();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormData>({
    defaultValues: {
      title: "",
      company: "",
      location: "",
      type: "full-time",
      practiceType: "",
      salaryMin: 0,
      salaryMax: 0,
      signOnBonus: undefined,
      description: "",
      requirements: "",
      benefits: "",
      applicationUrl: "",
      contactEmail: "",
    },
  });

  const createJobMutation = useMutation({
    mutationFn: createJob,
    onSuccess: (data) => {
      navigate("/jobs/post/payment", { state: { jobData: data } });
    },
  });

  const onSubmit = (data: JobFormData) => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/jobs/post");
      return;
    }
    createJobMutation.mutate(data);
  };

  return (
    <Container className="job-form-container">
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Post a New Job
          </Typography>

          {!isAuthenticated && (
            <Alert severity="info" className="auth-alert">
              You need to be logged in to post a job. Please{" "}
              <Button
                color="info"
                onClick={() => navigate("/login?redirect=/jobs/post")}>
                log in
              </Button>{" "}
              or{" "}
              <Button
                color="info"
                onClick={() => navigate("/signup?redirect=/jobs/post")}>
                create an account
              </Button>
              .
            </Alert>
          )}

          {createJobMutation.isError && (
            <Alert severity="error" className="error-alert">
              {createJobMutation.error.message ||
                "Failed to create job posting"}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="job-post-form">
            <div className="form-row">
              <Controller
                name="title"
                control={control}
                rules={{ required: "Job title is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Job Title"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
              <Controller
                name="type"
                control={control}
                rules={{ required: "Job type is required" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Job Type</InputLabel>
                    <Select {...field} label="Job Type">
                      <MenuItem value="full-time">Full Time</MenuItem>
                      <MenuItem value="part-time">Part Time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="relief">Relief</MenuItem>
                    </Select>
                    {errors.type && (
                      <FormHelperText>{errors.type.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </div>

            <div className="form-row">
              <Controller
                name="company"
                control={control}
                rules={{ required: "Company name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Company"
                    fullWidth
                    error={!!errors.company}
                    helperText={errors.company?.message}
                  />
                )}
              />
              <Controller
                name="location"
                control={control}
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Location"
                    fullWidth
                    error={!!errors.location}
                    helperText={errors.location?.message}
                  />
                )}
              />
            </div>

            <div className="form-row">
              <Controller
                name="practiceType"
                control={control}
                rules={{ required: "Practice type is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Practice Type"
                    fullWidth
                    error={!!errors.practiceType}
                    helperText={errors.practiceType?.message}
                  />
                )}
              />
              <Controller
                name="signOnBonus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Sign-on Bonus"
                    type="number"
                    fullWidth
                    error={!!errors.signOnBonus}
                    helperText={errors.signOnBonus?.message}
                  />
                )}
              />
            </div>

            <div className="salary-range">
              <Controller
                name="salaryMin"
                control={control}
                rules={{
                  required: "Minimum salary is required",
                  min: { value: 0, message: "Must be greater than 0" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Minimum Salary"
                    fullWidth
                    error={!!errors.salaryMin}
                    helperText={errors.salaryMin?.message}
                  />
                )}
              />
              <Controller
                name="salaryMax"
                control={control}
                rules={{
                  required: "Maximum salary is required",
                  validate: (value, formValues) =>
                    Number(value) >= Number(formValues.salaryMin) ||
                    "Maximum salary must be greater than minimum salary",
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Maximum Salary"
                    fullWidth
                    error={!!errors.salaryMax}
                    helperText={errors.salaryMax?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="description"
              control={control}
              rules={{ required: "Job description is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Job Description"
                  multiline
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Controller
              name="requirements"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Requirements"
                  multiline
                  fullWidth
                  error={!!errors.requirements}
                  helperText={errors.requirements?.message}
                />
              )}
            />

            <Controller
              name="benefits"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Benefits"
                  multiline
                  fullWidth
                  error={!!errors.benefits}
                  helperText={errors.benefits?.message}
                />
              )}
            />

            <div className="form-row">
              <Controller
                name="applicationUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Application URL"
                    fullWidth
                    error={!!errors.applicationUrl}
                    helperText={errors.applicationUrl?.message}
                  />
                )}
              />
              <Controller
                name="contactEmail"
                control={control}
                rules={{
                  required: "Contact email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Email"
                    fullWidth
                    error={!!errors.contactEmail}
                    helperText={errors.contactEmail?.message}
                  />
                )}
              />
            </div>

            <Box className="form-actions">
              <Button
                variant="outlined"
                onClick={() => navigate("/jobs")}
                className="cancel-button">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createJobMutation.isPending}
                className="submit-button">
                Continue to Payment
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default JobForm;
