import React from "react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  Link,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../../context/SnackbarContext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachmentIcon from "@mui/icons-material/Attachment";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link as RouterLink } from "react-router-dom";
import { JobRecord } from "../../../../shared-types/types";
import { submitJobApplication } from "../../queries/jobApplicationQueries";
import "./JobApplicationForm.css";

interface JobApplicationFormProps {
  job: JobRecord;
  open: boolean;
  onClose: () => void;
}

interface ApplicationFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  resume: FileList | null;
}

const JobApplicationForm = ({
  job,
  open,
  onClose,
}: JobApplicationFormProps) => {
  const { isAuthenticated, email } = useAuth();
  const { openSnackbar } = useSnackbar();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    defaultValues: {
      fullName: "",
      email: email || "",
      phoneNumber: "",
      resume: null,
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("phoneNumber", data.phoneNumber);
      if (data.resume && data.resume.length > 0) {
        formData.append("resume", data.resume[0]);
      }
      return submitJobApplication(job.id, formData);
    },
    onSuccess: () => {
      openSnackbar("Application submitted successfully!", "success");
      onClose();
    },
    onError: (error: Error) => {
      openSnackbar(error.message || "Failed to submit application", "error");
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setValue("resume", event.target.files);
      setResumeError(null);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setValue("resume", null);
  };

  const onSubmit = (data: ApplicationFormData) => {
    if (!uploadedFile) {
      setResumeError("Resume is required");
      return;
    }
    applicationMutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Apply to {job.title} at {job.company}
      </DialogTitle>
      <DialogContent>
        {!isAuthenticated ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please{" "}
            <Link component={RouterLink} to="/login">
              log in
            </Link>{" "}
            or{" "}
            <Link component={RouterLink} to="/signup">
              create an account
            </Link>{" "}
            to apply
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box className="application-form-fields">
              <Controller
                name="fullName"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    fullWidth
                    disabled={!isAuthenticated}
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    margin="normal"
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    disabled={!isAuthenticated}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    margin="normal"
                  />
                )}
              />

              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    disabled={!isAuthenticated}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                    margin="normal"
                  />
                )}
              />

              <Box className="resume-upload-section">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: "none" }}
                  id="resume-upload"
                  onChange={handleFileUpload}
                  disabled={!isAuthenticated}
                />
                <label htmlFor="resume-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    disabled={!isAuthenticated}>
                    Upload Resume
                  </Button>
                </label>
                {resumeError && (
                  <Typography
                    variant="caption"
                    color="error"
                    style={{ display: "block", marginTop: "8px" }}>
                    {resumeError}
                  </Typography>
                )}

                {uploadedFile && (
                  <Box className="uploaded-file-info">
                    <AttachmentIcon />
                    <Typography>{uploadedFile.name}</Typography>
                    <IconButton onClick={handleRemoveFile} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
          </form>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={!isAuthenticated || applicationMutation.isPending}>
          {applicationMutation.isPending
            ? "Submitting..."
            : "Submit Application"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobApplicationForm;
