import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachmentIcon from "@mui/icons-material/AttachFile";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { NumericFormat } from "react-number-format";
import "./CompForm.css";
import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { getLocationSuggestions } from "../../queries/locationQueries";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  generalPracticeOptions,
  paymentFrequencyOptions,
  specialistOptions,
} from "./CompFormData";
import { ICompFormInput, ICompensation } from "../../../../shared-types/types";
import {
  createCompensation,
  updateCompensation,
} from "../../queries/compensationQueries";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSnackbar } from "../../context/SnackbarContext";
import { useAuth } from "../../context/AuthContext";

interface CompFormProps {
  existingCompensation?: ICompensation;
}

const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return "";
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPercent = (value: number | null | undefined): string => {
  if (value == null) return "";
  return `${value}%`;
};

const SectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <Box className="form-section-header">
    <Box className="form-section-icon">{icon}</Box>
    <Box>
      <Typography className="form-section-title" component="h2">
        {title}
      </Typography>
      {subtitle && (
        <Typography className="form-section-subtitle">{subtitle}</Typography>
      )}
    </Box>
  </Box>
);

export const CompForm = ({ existingCompensation }: CompFormProps) => {
  const isEditMode = !!existingCompensation;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ICompFormInput>({
    defaultValues: existingCompensation
      ? {
          company: existingCompensation.company,
          title: existingCompensation.title,
          typeOfPractice: existingCompensation.type_of_practice || "",
          isSpecialist: existingCompensation.is_specialist,
          specialization: existingCompensation.specialization || "",
          isNewGrad: existingCompensation.is_new_grad,
          yearsOfExperience: String(existingCompensation.years_of_experience),
          location: existingCompensation.location,
          baseSalary: formatCurrency(existingCompensation.base_salary),
          hourlyRate: formatCurrency(existingCompensation.hourly_rate),
          paymentFrequency: (existingCompensation.payment_frequency ===
          "annually"
            ? "Annually"
            : existingCompensation.payment_frequency === "hourly"
              ? "Hourly"
              : "") as ICompFormInput["paymentFrequency"],
          signOnBonus: formatCurrency(existingCompensation.sign_on_bonus),
          averageAnnualProduction: formatCurrency(
            existingCompensation.average_annual_production
          ),
          percentProduction: formatPercent(
            existingCompensation.percent_production
          ),
          gender: existingCompensation.gender || "",
          numberOfVeterinarians:
            existingCompensation.number_of_veterinarians != null
              ? String(existingCompensation.number_of_veterinarians)
              : "",
          verificationDocument: null,
          verificationDocumentName: "",
          daysWorkedPerWeek:
            existingCompensation.days_worked_per_week != null
              ? String(existingCompensation.days_worked_per_week)
              : "",
          email: existingCompensation.email || "",
          isPracticeOwner: existingCompensation.is_practice_owner,
          practiceDescription:
            existingCompensation.practice_description || "",
          isTraveling: existingCompensation.is_traveling,
          travelNotes: existingCompensation.travel_notes || "",
        }
      : {
          company: "",
          title: "",
          typeOfPractice: "",
          isSpecialist: false,
          specialization: "",
          isNewGrad: false,
          yearsOfExperience: "",
          location: "",
          baseSalary: "",
          hourlyRate: "",
          paymentFrequency: "",
          signOnBonus: "",
          averageAnnualProduction: "",
          percentProduction: "",
          gender: "",
          numberOfVeterinarians: "",
          verificationDocument: null,
          verificationDocumentName: "",
          daysWorkedPerWeek: "",
          email: "",
          isPracticeOwner: false,
          practiceDescription: "",
          isTraveling: false,
          travelNotes: "",
        },
  });

  const [locationQuery, setLocationQuery] = useState<string>(
    existingCompensation?.location || ""
  );
  const [options, setOptions] = useState<string[]>([]);
  const [showSignOnBonus, setShowSignOnBonus] = useState(
    existingCompensation?.sign_on_bonus != null
  );
  const [showPercentProduction, setShowPercentProduction] = useState(
    existingCompensation?.percent_production != null
  );
  const [showAverageAnnualProduction, setShowAverageAnnualProduction] =
    useState(existingCompensation?.average_annual_production != null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSpecialist, setIsSpecialist] = useState(
    existingCompensation?.is_specialist || false
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { openSnackbar } = useSnackbar();
  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const {
    data: locations,
    isLoading: locationIsLoading,
    refetch,
  } = useQuery({
    queryKey: ["locations", locationQuery],
    queryFn: () => getLocationSuggestions(locationQuery),
    enabled: false,
  });

  const mutationErrorHandler = (error: any) => {
    if (error.error?.details) {
      error.error.details.forEach(
        (err: { path: string; message: string }) => {
          setError(err.path[0] as keyof ICompFormInput, {
            type: "manual",
            message: err.message,
          });
        }
      );
    } else {
      setError("root.serverError", {
        type: "manual",
        message:
          error.error?.message ||
          error.message ||
          "An unexpected error occurred. Please try again later.",
      });
    }
  };

  const addCompensationMutation = useMutation({
    mutationFn: createCompensation,
    onError: mutationErrorHandler,
    onSuccess: async (data) => {
      navigate("/");
      openSnackbar(
        data.message ||
          "Success! Thank you, your compensation details will be reviewed as soon as possible.",
        "success"
      );
    },
  });

  const updateCompensationMutation = useMutation({
    mutationFn: updateCompensation,
    onError: mutationErrorHandler,
    onSuccess: async (data) => {
      navigate("/dashboard");
      openSnackbar(
        data.message ||
          "Your compensation has been updated successfully.",
        "success"
      );
    },
  });

  useEffect(() => {
    if (locationQuery.length > 2) {
      refetch();
    }
  }, [locationQuery, refetch]);

  useEffect(() => {
    if (locations) {
      setOptions(locations);
    }
  }, [locations]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadedFile(file);
      setValue("verificationDocument", [file]);
      setValue("verificationDocumentName", file.name);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileName(null);
    setUploadedFile(null);
    setValue("verificationDocument", null);
    setValue("verificationDocumentName", "");
  };

  const handleFileOpen = () => {
    if (uploadedFile) {
      const fileURL = URL.createObjectURL(uploadedFile);
      window.open(fileURL, "_blank");
    }
  };

  const handleLocationChange = (_event: any, value: any) => {
    setValue("location", value || "");
  };

  const handleLocationInputChange: any = (event: any, value: string) => {
    setLocationQuery(event?.target.value || value);
  };

  const handleIsNewGrad = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setValue("isNewGrad", true);
      setValue("yearsOfExperience", "0");
    } else {
      setValue("isNewGrad", false);
    }
  };

  const paymentFrequency: string = watch("paymentFrequency");
  const isNewGrad: boolean = watch("isNewGrad");
  const isPracticeOwner: boolean = watch("isPracticeOwner");
  const isTraveling: boolean = watch("isTraveling");

  const onSubmit: SubmitHandler<ICompFormInput> = async (
    data: ICompFormInput
  ) => {
    if (isEditMode && existingCompensation) {
      updateCompensationMutation.mutateAsync({
        compId: existingCompensation.id,
        data,
      });
    } else {
      addCompensationMutation.mutateAsync(data);
    }
  };

  return (
    <Box className="form-page-wrapper">
      <Container maxWidth={false} className="form-container">
        <Box className="form-hero">
          <Typography component="h1">
            {isEditMode ? "Edit Your Compensation" : "Add Your Compensation"}
          </Typography>
          <Typography component="p">
            {isEditMode
              ? "Update your entry below. Edits will be re-reviewed before going live."
              : "Help build a transparent salary picture for the veterinary community. It only takes a few minutes."}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {!isAuthenticated && !isEditMode && (
              <Paper elevation={0} className="form-account-signup">
                <Typography className="signup-title">
                  Create an account for salary comparison
                </Typography>
                <Typography className="signup-message">
                  Having an account unlocks our salary comparison tool so you can
                  see how your compensation stacks up.
                </Typography>
                <Typography variant="body2">
                  <RouterLink to="/signup" className="sign-up-link">
                    Create one for free
                  </RouterLink>{" "}
                  or continue below without one.
                </Typography>
              </Paper>
            )}

            {isEditMode && (
              <Paper elevation={0} className="form-edit-note">
                <Typography variant="body2">
                  Editing this entry will send it back for review. If you have
                  started a new job, please{" "}
                  <RouterLink to="/addcomp" className="sign-up-link">
                    add a new compensation
                  </RouterLink>{" "}
                  instead of editing this one!
                </Typography>
              </Paper>
            )}

            {/* SECTION 1: JOB DETAILS */}
            <Paper elevation={0} className="form-section-card">
              <SectionHeader
                icon={<WorkOutlineIcon />}
                title="Job Details"
                subtitle="Tell us about your role and workplace"
              />
              <Stack spacing={2.5}>
                <Controller
                  name="company"
                  control={control}
                  rules={{
                    required: "Company is required",
                    validate: (value) =>
                      value.trim().length > 0 || "Company is required",
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Company or Hospital Name"
                      placeholder="Banfield Pet Hospital"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="location"
                  control={control}
                  rules={{ required: "Location is required" }}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      {...field}
                      value={field.value || ""}
                      onChange={handleLocationChange}
                      inputValue={locationQuery}
                      onInputChange={handleLocationInputChange}
                      options={options}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Primary Location"
                          placeholder="e.g. Boston, MA"
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error?.message ||
                            "Format: City, two-letter state/country code. Use your nearest metro if you prefer not to disclose."
                          }
                          slotProps={{
                            ...params.slotProps,
                            input: {
                              ...params.slotProps.input,
                              endAdornment: (
                                <>
                                  {locationIsLoading ? (
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
                                  ) : null}
                                  {params.slotProps.input.endAdornment}
                                </>
                              ),
                            },
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Typography variant="body2">{option}</Typography>
                        </li>
                      )}
                      noOptionsText="Format: 'City, two letter state code' or 'City, Country Code'"
                    />
                  )}
                />

                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Title is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Job Title"
                      placeholder="Associate Veterinarian"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />

                <Box className="checkbox-row">
                  <Controller
                    name="isSpecialist"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            onChange={(e) => {
                              field.onChange(e.target.checked);
                              setIsSpecialist(!isSpecialist);
                            }}
                          />
                        }
                        label="Specialist"
                      />
                    )}
                  />
                  <Controller
                    name="isPracticeOwner"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox {...field} checked={field.value} />
                        }
                        label="Practice Owner"
                      />
                    )}
                  />
                  <Controller
                    name="isTraveling"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox {...field} checked={field.value} />
                        }
                        label="Multiple Locations"
                      />
                    )}
                  />
                </Box>

                <Controller
                  name={isSpecialist ? "specialization" : "typeOfPractice"}
                  control={control}
                  rules={{ required: "This field is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>
                        {isSpecialist
                          ? "Specialization"
                          : "Type of Practice"}
                      </InputLabel>
                      <Select
                        {...field}
                        label={
                          isSpecialist
                            ? "Specialization"
                            : "Type of Practice"
                        }
                        displayEmpty>
                        <MenuItem value="" disabled>
                          Select{" "}
                          {isSpecialist
                            ? "specialization"
                            : "type of practice"}
                        </MenuItem>
                        {(isSpecialist
                          ? specialistOptions
                          : generalPracticeOptions
                        ).map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}>
                  <Controller
                    name="yearsOfExperience"
                    control={control}
                    rules={{ required: "Years of Experience is required" }}
                    render={({ field, fieldState }) => {
                      const { ref, ...rest } = field;
                      return (
                        <NumericFormat
                          {...rest}
                          customInput={TextField}
                          getInputRef={ref}
                          label="Years of Experience"
                          placeholder="0"
                          value={isNewGrad ? 0 : rest.value}
                          disabled={isNewGrad}
                          thousandSeparator={false}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          sx={{ flex: 1 }}
                        />
                      );
                    }}
                  />
                  <Controller
                    name="isNewGrad"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            onChange={(e) => handleIsNewGrad(e)}
                          />
                        }
                        label="New Graduate"
                      />
                    )}
                  />
                </Stack>

                {isPracticeOwner && (
                  <Controller
                    name="practiceDescription"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Practice Description"
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Add a note about your practice (optional)"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}

                {isTraveling && (
                  <Controller
                    name="travelNotes"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Travel Details"
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Locations/regions you travel to (optional)"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              </Stack>
            </Paper>

            {/* SECTION 2: COMPENSATION */}
            <Paper elevation={0} className="form-section-card">
              <SectionHeader
                icon={<PaidOutlinedIcon />}
                title="Compensation"
                subtitle="Your base pay and any extras"
              />
              <Stack spacing={2.5}>
                <Controller
                  name="paymentFrequency"
                  control={control}
                  rules={{ required: "Payment frequency is required" }}
                  render={({ field, fieldState }) => (
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, color: "text.secondary" }}>
                        Payment Frequency
                      </Typography>
                      <ToggleButtonGroup
                        className="payment-toggle-group"
                        value={field.value || null}
                        exclusive
                        onChange={(_, value) => {
                          if (value !== null) field.onChange(value);
                        }}
                        aria-label="payment frequency">
                        {paymentFrequencyOptions.map((option: string) => (
                          <ToggleButton key={option} value={option}>
                            {option}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                      {fieldState.error && (
                        <Typography
                          color="error"
                          variant="caption"
                          sx={{ mt: 0.5, display: "block" }}>
                          {fieldState.error.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />

                {paymentFrequency === "Annually" && (
                  <Controller
                    name="baseSalary"
                    control={control}
                    rules={{ required: "Base Salary is required" }}
                    render={({ field, fieldState }) => {
                      const { ref, ...rest } = field;
                      return (
                        <NumericFormat
                          {...rest}
                          getInputRef={ref}
                          fullWidth
                          label="Base Salary"
                          placeholder="$0.00"
                          customInput={TextField}
                          thousandSeparator={true}
                          prefix={"$"}
                          decimalScale={2}
                          fixedDecimalScale={true}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      );
                    }}
                  />
                )}

                {paymentFrequency === "Hourly" && (
                  <Controller
                    name="hourlyRate"
                    control={control}
                    rules={{ required: "Hourly Rate is required" }}
                    render={({ field, fieldState }) => {
                      const { ref, ...rest } = field;
                      return (
                        <NumericFormat
                          {...rest}
                          getInputRef={ref}
                          fullWidth
                          label="Hourly Rate"
                          placeholder="$0"
                          customInput={TextField}
                          thousandSeparator={true}
                          prefix={"$"}
                          decimalScale={2}
                          fixedDecimalScale={true}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      );
                    }}
                  />
                )}

                <Divider sx={{ my: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    OPTIONAL EXTRAS
                  </Typography>
                </Divider>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Button
                    className="expand-btn"
                    type="button"
                    variant={showSignOnBonus ? "contained" : "outlined"}
                    size="small"
                    startIcon={
                      showSignOnBonus ? <RemoveIcon /> : <AddIcon />
                    }
                    onClick={() => setShowSignOnBonus(!showSignOnBonus)}>
                    Sign On Bonus
                  </Button>
                  <Button
                    className="expand-btn"
                    type="button"
                    variant={showPercentProduction ? "contained" : "outlined"}
                    size="small"
                    startIcon={
                      showPercentProduction ? <RemoveIcon /> : <AddIcon />
                    }
                    onClick={() =>
                      setShowPercentProduction(!showPercentProduction)
                    }>
                    Production Bonus
                  </Button>
                  <Button
                    className="expand-btn"
                    type="button"
                    variant={
                      showAverageAnnualProduction ? "contained" : "outlined"
                    }
                    size="small"
                    startIcon={
                      showAverageAnnualProduction ? (
                        <RemoveIcon />
                      ) : (
                        <AddIcon />
                      )
                    }
                    onClick={() =>
                      setShowAverageAnnualProduction(
                        !showAverageAnnualProduction
                      )
                    }>
                    Annual Production
                  </Button>
                </Box>

                {showSignOnBonus && (
                  <Controller
                    name="signOnBonus"
                    control={control}
                    render={({ field, fieldState }) => {
                      const { ref, ...rest } = field;
                      return (
                        <NumericFormat
                          {...rest}
                          getInputRef={ref}
                          label="Sign On Bonus"
                          placeholder="$0"
                          fullWidth
                          customInput={TextField}
                          thousandSeparator={true}
                          prefix={"$"}
                          decimalScale={2}
                          fixedDecimalScale={true}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      );
                    }}
                  />
                )}

                {showPercentProduction && (
                  <Controller
                    name="percentProduction"
                    control={control}
                    render={({ field, fieldState }) => {
                      const { ref, ...rest } = field;
                      return (
                        <NumericFormat
                          {...rest}
                          getInputRef={ref}
                          label="Production Bonus"
                          placeholder="20%"
                          fullWidth
                          customInput={TextField}
                          thousandSeparator={true}
                          suffix={"%"}
                          decimalScale={2}
                          fixedDecimalScale={true}
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error?.message ||
                            "What percentage of your total production goes towards your salary?"
                          }
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Tooltip
                                    title="What percentage of your total production goes towards your salary?"
                                    placement="top">
                                    <InfoIcon
                                      fontSize="small"
                                      sx={{
                                        color: "text.secondary",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </Tooltip>
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      );
                    }}
                  />
                )}

                {showAverageAnnualProduction && (
                  <Controller
                    name="averageAnnualProduction"
                    control={control}
                    render={({ field, fieldState }) => {
                      const { ref, ...rest } = field;
                      return (
                        <NumericFormat
                          {...rest}
                          getInputRef={ref}
                          label="Average Annual Production"
                          placeholder="$20,000"
                          fullWidth
                          customInput={TextField}
                          thousandSeparator={true}
                          prefix={"$"}
                          decimalScale={2}
                          fixedDecimalScale={true}
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error?.message ||
                            "On average, how much do you make each year from production alone?"
                          }
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Tooltip
                                    title="On average, how much money do you make each year from production alone?"
                                    placement="top">
                                    <InfoIcon
                                      fontSize="small"
                                      sx={{
                                        color: "text.secondary",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </Tooltip>
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      );
                    }}
                  />
                )}
              </Stack>
            </Paper>

            {/* SECTION 3: VERIFICATION */}
            <Paper elevation={0} className="form-section-card">
              <SectionHeader
                icon={<VerifiedOutlinedIcon />}
                title="Verification"
                subtitle="Optional, but helps build trust in your entry"
              />
              <Box className="file-upload-area">
                <input
                  name="verificationDocument"
                  accept=".pdf,.doc,.docx"
                  style={{ display: "none" }}
                  id="verification-file-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <Controller
                  name="verificationDocumentName"
                  control={control}
                  render={({ field }) => <input {...field} type="hidden" />}
                />
                <label htmlFor="verification-file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    className="upload-btn">
                    Upload Document
                  </Button>
                </label>
                {uploadedFileName && (
                  <Box className="uploaded-file-info">
                    <AttachmentIcon fontSize="small" />
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFileOpen();
                      }}
                      className="uploaded-file-link">
                      {uploadedFileName}
                    </Link>
                    <IconButton
                      onClick={handleRemoveFile}
                      size="small"
                      sx={{ ml: "auto" }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <Typography className="file-upload-caption">
                  Accepts .pdf, .doc, .docx (max 5MB). Upload an offer letter or
                  pay stub. Files are encrypted during transfer and deleted after
                  review.
                </Typography>
              </Box>
              {errors.verificationDocument && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {typeof errors.verificationDocument.message === "string"
                    ? errors.verificationDocument.message
                    : "Invalid file"}
                </Typography>
              )}
            </Paper>

            {/* SECTION 4: ADDITIONAL INFO */}
            <Paper elevation={0} className="form-section-card">
              <SectionHeader
                icon={<TuneOutlinedIcon />}
                title="Additional Info"
                subtitle="Optional details to enrich the comparison data"
              />
              <Stack spacing={2.5}>
                <Controller
                  name="daysWorkedPerWeek"
                  control={control}
                  render={({ field, fieldState }) => {
                    const { ref, ...rest } = field;
                    return (
                      <NumericFormat
                        customInput={TextField}
                        {...rest}
                        getInputRef={ref}
                        label="Average days worked per week"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    );
                  }}
                />

                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select {...field} label="Gender" displayEmpty>
                        <MenuItem value="" disabled>
                          Select gender
                        </MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="non-binary">Non-binary</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="numberOfVeterinarians"
                  control={control}
                  render={({ field, fieldState }) => {
                    const { ref, ...rest } = field;
                    return (
                      <NumericFormat
                        {...rest}
                        getInputRef={ref}
                        customInput={TextField}
                        label="Number of Veterinarians in Practice"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    );
                  }}
                />

                {!isAuthenticated && !isEditMode && (
                  <Controller
                    name="email"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Email"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={
                          fieldState.error?.message || (
                            <>
                              Email will never be shared/sold/used for marketing
                              or spam. Required if you want your data linked to
                              an email address.
                            </>
                          )
                        }
                      />
                    )}
                  />
                )}
              </Stack>
            </Paper>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              className="submit-button">
              {isEditMode ? "Save Changes" : "Submit Compensation"}
            </Button>

            {errors.root?.serverError && (
              <Typography
                color="error"
                sx={{ textAlign: "center", mt: 1 }}>
                {errors.root.serverError.message}
              </Typography>
            )}
          </Stack>
        </form>
      </Container>
    </Box>
  );
};
