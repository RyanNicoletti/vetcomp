import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  Tooltip,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { createJob } from "../../queries/jobQueries";
import { getLocationSuggestions } from "../../queries/locationQueries";
import { useUserStatus } from "../../hooks/useUserStatus";
import { useState } from "react";
import "./JobForm.css";
import { NumericFormat } from "react-number-format";
import { convertCurrencyToNumber } from "../../utils/moneyFormatter";
import { JobFormData } from "../../../../shared-types/types";

const practiceTypes = [
  "Small animal",
  "Large animal",
  "Mixed practice",
  "Emergency",
  "Specialty",
  "Shelter",
];

const JobForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStatus();
  const [locationQuery, setLocationQuery] = useState("");
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    defaultValues: {
      company: "",
      title: "",
      location: "",
      practiceType: "",
      type: "full-time",
      salaryMin: undefined,
      salaryMax: undefined,
      signOnBonus: undefined,
      description: "",
      requirements: "",
      benefits: "",
      applicationMethod: "email",
      applicationUrl: "",
      contactEmail: "",
      experienceMin: undefined,
      experienceMax: undefined,
    },
  });

  const applicationMethod = watch("applicationMethod");

  const { data: locationSuggestions, isLoading: locationIsLoading } = useQuery({
    queryKey: ["locations", locationQuery],
    queryFn: () => getLocationSuggestions(locationQuery),
    enabled: locationQuery.length > 2,
  });

  const onSubmit = (data: JobFormData) => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/jobs/post");
      return;
    }
    navigate("/jobs/payment", { state: { jobData: data } });
  };

  const handleLocationChange = (_event: any, value: any) => {
    setValue("location", value || "");
  };

  const handleLocationInputChange = (event: any, newInputValue: string) => {
    setLocationQuery(newInputValue);
  };

  return (
    <div className="job-posting-page">
      <Container className="job-posting-form-container">
        <Card>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom>
              Post a New Job
            </Typography>
            {generalError && (
              <Alert
                severity="error"
                className="job-posting-error-alert"
                onClose={() => setGeneralError(null)}>
                {generalError}
              </Alert>
            )}

            {!isAuthenticated && (
              <Alert severity="info" className="job-posting-auth-alert">
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

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="job-posting-form">
              <div className="job-posting-form-row">
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
              </div>

              <div className="job-posting-form-row">
                <Controller
                  name="location"
                  control={control}
                  rules={{
                    required: "Location is required",
                  }}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      {...field}
                      value={field.value || ""}
                      onChange={handleLocationChange}
                      inputValue={locationQuery}
                      onInputChange={handleLocationInputChange}
                      options={locationSuggestions || []}
                      fullWidth
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Location"
                          placeholder="e.g. Boston, MA - Dublin, IE - New York, NY"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {locationIsLoading ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Typography variant="body2">{option}</Typography>
                        </li>
                      )}
                      noOptionsText="No locations found"
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
              <div className="job-posting-form-row">
                <Controller
                  name="salaryMin"
                  control={control}
                  rules={{
                    required: "Minimum salary is required",
                    min: { value: 0, message: "Must be greater than 0" },
                  }}
                  render={({ field: { ref, ...field }, fieldState }) => (
                    <NumericFormat
                      {...field}
                      label="Minimum Salary"
                      getInputRef={ref}
                      fullWidth
                      placeholder="$0.00"
                      customInput={TextField}
                      thousandSeparator={true}
                      prefix={"$"}
                      decimalScale={2}
                      fixedDecimalScale={true}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="salaryMax"
                  control={control}
                  rules={{
                    required: "Maximum salary is required",
                    validate: {
                      greaterThanMin: (value) =>
                        convertCurrencyToNumber(value) >=
                          convertCurrencyToNumber(getValues("salaryMin")) ||
                        "Maximum salary must be greater than minimum salary",
                    },
                  }}
                  render={({ field: { ref, ...field }, fieldState }) => (
                    <NumericFormat
                      {...field}
                      label="Maximum Salary"
                      getInputRef={ref}
                      fullWidth
                      placeholder="$0.00"
                      customInput={TextField}
                      thousandSeparator={true}
                      prefix={"$"}
                      decimalScale={2}
                      fixedDecimalScale={true}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </div>

              <div className="job-posting-form-row">
                <Controller
                  name="signOnBonus"
                  control={control}
                  render={({ field: { ref, ...field }, fieldState }) => (
                    <NumericFormat
                      {...field}
                      getInputRef={ref}
                      label="Sign-on Bonus"
                      fullWidth
                      placeholder="$0.00"
                      customInput={TextField}
                      thousandSeparator={true}
                      prefix={"$"}
                      decimalScale={2}
                      fixedDecimalScale={true}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="practiceType"
                  control={control}
                  rules={{ required: "Practice type is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.practiceType}>
                      <InputLabel>Practice Type</InputLabel>
                      <Select {...field} label="Practice Type">
                        {practiceTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.practiceType && (
                        <FormHelperText>
                          {errors.practiceType.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </div>

              <div className="job-posting-form-row">
                <Controller
                  name="experienceMin"
                  control={control}
                  rules={{
                    min: { value: 0, message: "Must be 0 or greater" },
                    validate: {
                      lessThanMax: (value) => {
                        const max = Number(watch("experienceMax"));
                        const min = Number(value);
                        if (min && max && min > max) {
                          return "Minimum experience must be less than maximum";
                        }
                        return true;
                      },
                    },
                  }}
                  render={({ field: { ref, ...field }, fieldState }) => (
                    <NumericFormat
                      {...field}
                      getInputRef={ref}
                      label="Min. Years Experience"
                      fullWidth
                      placeholder="0"
                      customInput={TextField}
                      allowNegative={false}
                      decimalScale={0}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      isAllowed={(values) => {
                        const { floatValue } = values;
                        return floatValue === undefined || floatValue >= 0;
                      }}
                    />
                  )}
                />

                <Controller
                  name="experienceMax"
                  control={control}
                  rules={{
                    min: { value: 1, message: "Must be 1 or more" },
                  }}
                  render={({ field: { ref, ...field }, fieldState }) => (
                    <NumericFormat
                      {...field}
                      getInputRef={ref}
                      label="Max. Years Experience"
                      fullWidth
                      placeholder="0"
                      customInput={TextField}
                      allowNegative={false}
                      decimalScale={0}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      isAllowed={(values) => {
                        const { floatValue } = values;
                        return floatValue === undefined || floatValue >= 0;
                      }}
                    />
                  )}
                />
              </div>

              <div className="job-posting-description">
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
              </div>

              <div className="job-posting-requirements">
                <Controller
                  name="requirements"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Requirements"
                      multiline
                      rows={4}
                      fullWidth
                      error={!!errors.requirements}
                      helperText={errors.requirements?.message}
                    />
                  )}
                />
              </div>

              <div className="job-posting-benefits">
                <Controller
                  name="benefits"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Benefits"
                      multiline
                      rows={4}
                      fullWidth
                      error={!!errors.benefits}
                      helperText={errors.benefits?.message}
                    />
                  )}
                />
              </div>

              <div className="job-posting-application-method">
                <Controller
                  name="applicationMethod"
                  control={control}
                  rules={{ required: "Application method is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.applicationMethod}>
                      <InputLabel>
                        How would you like to receive applications?
                      </InputLabel>
                      <Select
                        {...field}
                        label="How would you like to receive applications?">
                        <MenuItem value="email">
                          Receive applications via email
                        </MenuItem>
                        <MenuItem value="external">
                          Link to external application site
                        </MenuItem>
                      </Select>
                      {errors.applicationMethod && (
                        <FormHelperText>
                          {errors.applicationMethod.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                {applicationMethod === "email" && (
                  <Controller
                    name="contactEmail"
                    control={control}
                    rules={{
                      required: "Email is required for email applications",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Application Email"
                        fullWidth
                        error={!!errors.contactEmail}
                        helperText={errors.contactEmail?.message}
                        sx={{ mt: 2 }}
                      />
                    )}
                  />
                )}

                {applicationMethod === "external" && (
                  <Controller
                    name="applicationUrl"
                    control={control}
                    rules={{
                      required: "URL is required for external applications",
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message:
                          "Please enter a valid URL starting with http:// or https://",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="External Application URL"
                        fullWidth
                        error={!!errors.applicationUrl}
                        helperText={errors.applicationUrl?.message}
                        sx={{ mt: 2 }}
                      />
                    )}
                  />
                )}
              </div>

              <Box className="job-posting-form-actions">
                <Button
                  variant="outlined"
                  onClick={() => navigate("/jobs")}
                  className="job-posting-cancel-btn">
                  Cancel
                </Button>
                <Tooltip
                  title={
                    !isAuthenticated
                      ? "Login or create an account to continue"
                      : ""
                  }
                  arrow>
                  <span>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!isAuthenticated}
                      className="job-posting-submit-btn">
                      Continue to Payment
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default JobForm;
