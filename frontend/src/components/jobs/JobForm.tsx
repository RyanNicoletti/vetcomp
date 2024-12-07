import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import "./JobPostForm.css";

interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: string;
  practiceType: string;
  salaryMin: string;
  salaryMax: string;
  signOnBonus: string;
  description: string;
  requirements: string;
  benefits: string;
  applicationUrl: string;
  contactEmail: string;
}

const JobForm = () => {
  const navigate = useNavigate();
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
      salaryMin: "",
      salaryMax: "",
      signOnBonus: "",
      description: "",
      requirements: "",
      benefits: "",
      applicationUrl: "",
      contactEmail: "",
    },
  });

  const onSubmit = (data: JobFormData) => {
    navigate("/jobs/post/payment", { state: { jobData: data } });
  };

  return (
    <Container className="job-post-container">
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Post a New Job
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)} className="job-post-form">
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

            <Box className="salary-range">
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
                    Number(value) >= Number(formValues.salaryMin) + 40000 ||
                    "Maximum salary must be at least $40,000 more than minimum",
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
            </Box>

            <Controller
              name="description"
              control={control}
              rules={{ required: "Job description is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Job Description"
                  multiline
                  rows={4}
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

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
