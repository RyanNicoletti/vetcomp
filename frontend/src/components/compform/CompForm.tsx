// frontend/src/components/compform/CompForm.tsx
// Enhanced styling version that maintains the exact working functionality

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  Link,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachmentIcon from "@mui/icons-material/Attachment";
import { NumericFormat } from "react-number-format";
import "./CompForm.css";
import { ChangeEvent, useEffect, useState } from "react";
import { getLocationSuggestions } from "../../queries/locationQueries";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  generalPracticeOptions,
  paymentFrequencyOptions,
  specialistOptions,
} from "./CompFormData";
import { ICompFormInput } from "../../../../shared-types/types";
import { createCompensation } from "../../queries/compensationQueries";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSnackbar } from "../../context/SnackbarContext";
import { useAuth } from "../../context/AuthContext";

export const CompForm = () => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ICompFormInput>({
    defaultValues: {
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

  const [locationQuery, setLocationQuery] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [showSignOnBonus, setShowSignOnBonus] = useState(false);
  const [showPercentProduction, setShowPercentProduction] = useState(false);
  const [showAverageAnnualProduction, setShowAverageAnnualProduction] =
    useState(false);
  const [isSpecialist, setIsSpecialist] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { isAuthenticated } = useAuth();

  const {
    data: locations,
    refetch,
    isLoading: locationIsLoading,
  } = useQuery({
    queryKey: ["locations", locationQuery],
    queryFn: () => getLocationSuggestions(locationQuery),
    enabled: false,
  });

  const addCompensationMutation = useMutation({
    mutationFn: createCompensation,
    onError: (error: any) => {
      if (error.status === 409) {
        setError("email", {
          type: "manual",
          message:
            "This email address is already associated with an account. Please use a different email or log in to your existing account.",
        });
      }
    },
    onSuccess: async (data) => {
      navigate("/");
      openSnackbar(
        data.message ||
          "Success! Thank you, your compensation details will be reviewed as soon as possible.",
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
    addCompensationMutation.mutateAsync(data);
  };

  // Scroll to first error when form has validation errors
  useEffect(() => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"], input[name="${firstErrorField}"], select[name="${firstErrorField}"], textarea[name="${firstErrorField}"]`
      ) as HTMLElement;

      if (errorElement) {
        // Scroll to the error field with some offset for better UX
        errorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Focus the field if it's focusable
        if (errorElement.focus) {
          setTimeout(() => {
            errorElement.focus();
          }, 500);
        }
      }
    }
  }, [errors]);

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit(onSubmit)} className="form-container">
        <Typography className="section-title" variant="h6">
          Company Information
        </Typography>

        <Controller
          name="company"
          control={control}
          rules={{
            required: "Company is required",
            validate: (value) =>
              value.trim().length > 0 || "Company is required",
          }}
          render={({ field, fieldState }) => (
            <Box>
              <Typography>Company or Hospital Name</Typography>
              <TextField
                {...field}
                placeholder="Banfield Pet Hospital"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            </Box>
          )}
        />

        <Controller
          name="title"
          control={control}
          rules={{ required: "Title is required" }}
          render={({ field, fieldState }) => (
            <Box>
              <Typography>Job Title</Typography>
              <TextField
                {...field}
                placeholder="Associate Veterinarian"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            </Box>
          )}
        />

        <Controller
          name="location"
          control={control}
          rules={{ required: "Location is required" }}
          render={({ field, fieldState }) => (
            <Box>
              <Typography>
                Primary Location
                <Tooltip
                  title="If you prefer not to disclose your exact location, please enter the closest metropolitan area."
                  placement="top">
                  <InfoIcon
                    fontSize="small"
                    style={{
                      marginLeft: "8px",
                      verticalAlign: "middle",
                      cursor: "pointer",
                    }}
                  />
                </Tooltip>
              </Typography>
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
                    placeholder="e.g. Boston, MA - Dublin, IE - New York, NY"
                    error={!!fieldState.error}
                    helperText={
                      fieldState.error?.message ||
                      "Format: `City, two letter state/country code`"
                    }
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
                noOptionsText="Format: 'City, two letter state code' or 'City, Country Code'"
              />
            </Box>
          )}
        />

        <Typography className="section-title" variant="h6">
          Position Information
        </Typography>

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
                    setIsSpecialist(e.target.checked);
                  }}
                />
              }
              label="Specialist"
            />
          )}
        />

        <Controller
          name={isSpecialist ? "specialization" : "typeOfPractice"}
          control={control}
          rules={{ required: "This field is required" }}
          render={({ field, fieldState }) => (
            <Box>
              <Typography>
                {isSpecialist ? "Specialization" : "Type of Practice"}
              </Typography>
              <FormControl fullWidth error={!!fieldState.error}>
                <Select {...field} displayEmpty>
                  <MenuItem value="" disabled>
                    Select{" "}
                    {isSpecialist ? "specialization" : "type of practice"}
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
                {fieldState.error && (
                  <Typography color="error" variant="caption">
                    {fieldState.error.message}
                  </Typography>
                )}
              </FormControl>
            </Box>
          )}
        />

        <Box className="yoe-container">
          <Controller
            name="yearsOfExperience"
            control={control}
            rules={{ required: "Years of Experience is required" }}
            render={({ field, fieldState }) => {
              const { ref, ...rest } = field;
              return (
                <Box className="yoe-input-container">
                  <Typography>Years of Experience</Typography>
                  <NumericFormat
                    {...rest}
                    className="years-of-experience-input"
                    customInput={TextField}
                    getInputRef={ref}
                    placeholder="0"
                    value={isNewGrad ? 0 : rest.value}
                    disabled={isNewGrad}
                    thousandSeparator={false}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                </Box>
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
                    onChange={(e) => {
                      handleIsNewGrad(e);
                    }}
                  />
                }
                label="New Graduate"
              />
            )}
          />
        </Box>

        <Typography className="section-title" variant="h6">
          Work Type
        </Typography>

        <div className="work-type-section">
          <div className="work-type-checkboxes">
            <Controller
              name="isPracticeOwner"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Practice Owner"
                />
              )}
            />

            <Controller
              name="isTraveling"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Multiple Locations"
                />
              )}
            />
          </div>

          {isPracticeOwner && (
            <Controller
              name="practiceDescription"
              control={control}
              render={({ field, fieldState }) => (
                <Box className="practice-description-field">
                  <Typography>Practice Description</Typography>
                  <TextField
                    {...field}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Optional: add a note about your practice"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                </Box>
              )}
            />
          )}

          {isTraveling && (
            <Controller
              name="travelNotes"
              control={control}
              render={({ field, fieldState }) => (
                <Box className="travel-notes-field">
                  <Typography>Travel Details</Typography>
                  <TextField
                    {...field}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Optional: add a note about what locations/regions you travel to"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                </Box>
              )}
            />
          )}
        </div>

        <Typography
          variant="h6"
          className="section-title"
          id="salaryInfoSection">
          Salary Information
        </Typography>

        <Controller
          name="paymentFrequency"
          control={control}
          rules={{ required: "Payment frequency is required" }}
          render={({ field, fieldState }) => (
            <Box
              className="payment-frequency-container"
              style={{
                display: "flex",
              }}>
              <div>
                <Typography>Payment Frequency: </Typography>
                <FormGroup row className="payment-frequency-checkboxes">
                  {paymentFrequencyOptions.map((option: string) => (
                    <FormControlLabel
                      className="payment-frequency-label"
                      key={option}
                      control={
                        <Checkbox
                          checked={field.value === option}
                          onChange={() => field.onChange(option)}
                        />
                      }
                      label={option}
                    />
                  ))}
                </FormGroup>
              </div>
              {fieldState.error && (
                <Typography color="error" variant="caption">
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
                <Box>
                  <Typography>Base Salary</Typography>
                  <NumericFormat
                    {...rest}
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
                </Box>
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
                <Box>
                  <Typography>Hourly Rate</Typography>
                  <NumericFormat
                    {...rest}
                    getInputRef={ref}
                    fullWidth
                    placeholder="$0"
                    customInput={TextField}
                    thousandSeparator={true}
                    prefix={"$"}
                    decimalScale={2}
                    fixedDecimalScale={true}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                </Box>
              );
            }}
          />
        )}

        <Box className="additional-comp-btns-container">
          <Button
            className="additional-comp-btn"
            type="button"
            variant="contained"
            size="small"
            onClick={() => setShowSignOnBonus(!showSignOnBonus)}>
            {showSignOnBonus ? "- Sign On Bonus" : "+ Sign On Bonus"}
          </Button>
          <Button
            className="additional-comp-btn"
            type="button"
            variant="contained"
            size="small"
            onClick={() => setShowPercentProduction(!showPercentProduction)}>
            {showPercentProduction
              ? "- Production Bonus"
              : "+ Production Bonus"}
          </Button>
          <Button
            className="additional-comp-btn"
            type="button"
            variant="contained"
            size="small"
            onClick={() =>
              setShowAverageAnnualProduction(!showAverageAnnualProduction)
            }>
            {showAverageAnnualProduction
              ? "- Annual Production"
              : "+ Annual Production"}
          </Button>
        </Box>

        {showSignOnBonus && (
          <Controller
            name="signOnBonus"
            control={control}
            render={({ field, fieldState }) => {
              const { ref, ...rest } = field;
              return (
                <Box>
                  <Typography>Sign On Bonus</Typography>
                  <NumericFormat
                    className="sign-on-bonus"
                    {...rest}
                    getInputRef={ref}
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
                </Box>
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
                <Box>
                  <Typography>
                    Production bonus
                    <Tooltip
                      title="What percentage of your total production goes towards your salary?"
                      placement="top">
                      <InfoIcon
                        fontSize="small"
                        style={{
                          marginLeft: "8px",
                          verticalAlign: "middle",
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  </Typography>
                  <NumericFormat
                    {...rest}
                    getInputRef={ref}
                    placeholder="20%"
                    fullWidth
                    customInput={TextField}
                    thousandSeparator={true}
                    suffix={"%"}
                    decimalScale={2}
                    fixedDecimalScale={true}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                </Box>
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
                <Box>
                  <Typography>
                    Average Annual Production
                    <Tooltip
                      title="On average, how much money do you make each year from production alone?"
                      placement="top">
                      <InfoIcon
                        fontSize="small"
                        style={{
                          marginLeft: "8px",
                          verticalAlign: "middle",
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  </Typography>
                  <NumericFormat
                    {...rest}
                    getInputRef={ref}
                    placeholder="$20,000"
                    fullWidth
                    customInput={TextField}
                    thousandSeparator={true}
                    prefix={"$"}
                    decimalScale={2}
                    fixedDecimalScale={true}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                </Box>
              );
            }}
          />
        )}

        <Typography className="section-title" variant="h6">
          Upload Verification (Optional)
        </Typography>

        <Box className="file-upload-container">
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
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              className="file-upload-btn">
              Upload Verification Document
            </Button>
          </label>
          {uploadedFileName && (
            <Box className="uploaded-file-info">
              <AttachmentIcon />
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleFileOpen();
                }}
                className="uploaded-file-link">
                {uploadedFileName}
              </Link>
              <IconButton onClick={handleRemoveFile} size="small">
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>
        {errors.verificationDocument && (
          <Typography
            color="error"
            variant="caption"
            style={{ marginTop: "8px" }}>
            {typeof errors.verificationDocument.message === "string"
              ? errors.verificationDocument.message
              : "Invalid file"}
          </Typography>
        )}
        <Typography
          variant="caption"
          color="textSecondary"
          id="fileUploadCaption">
          Upload an offer letter or pay stub for verification. Files are
          encrypted and stored securely before being reviewd, then deleted from
          our system.
        </Typography>

        <Typography className="section-title" variant="h6">
          Optional Fields
        </Typography>

        <Controller
          name="daysWorkedPerWeek"
          control={control}
          render={({ field, fieldState }) => {
            const { ref, ...rest } = field;
            return (
              <Box>
                <Typography>Average days worked per week</Typography>
                <NumericFormat
                  customInput={TextField}
                  {...rest}
                  getInputRef={ref}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              </Box>
            );
          }}
        />

        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Box>
              <Typography>Gender</Typography>
              <FormControl fullWidth>
                <Select {...field} displayEmpty>
                  <MenuItem value="">Prefer not to say</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="non-binary">Non-binary</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        />

        <Controller
          name="numberOfVeterinarians"
          control={control}
          render={({ field, fieldState }) => {
            const { ref, ...rest } = field;
            return (
              <Box>
                <Typography>Number of Veterinarians in Practice</Typography>
                <NumericFormat
                  {...rest}
                  getInputRef={ref}
                  customInput={TextField}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              </Box>
            );
          }}
        />

        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Box>
              <Typography>Email</Typography>
              <TextField
                {...field}
                type="email"
                fullWidth
                placeholder="your_email@example.com"
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message || (
                    <>
                      Will not be used/shared/sold for marketing or spam ever.{" "}
                      <br />
                      Required if you'd like to link comp data to an email
                      address.
                    </>
                  )
                }
              />
            </Box>
          )}
        />

        <div className="submit-container">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={addCompensationMutation.isPending}
            startIcon={
              addCompensationMutation.isPending ? (
                <CircularProgress size={20} />
              ) : null
            }>
            {addCompensationMutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </div>

        {!isAuthenticated && (
          <div className="sign-up-link-container">
            <Typography variant="body2" color="textSecondary">
              Want to track your submissions and use advanced features?{" "}
              <Link
                component={RouterLink}
                to="/signup"
                className="sign-up-link">
                Create a free account
              </Link>{" "}
              to manage your compensation data and access our salary comparison
              tool. You can always create an account later if you provided your
              email address above.
            </Typography>
          </div>
        )}
      </form>
    </div>
  );
};

export default CompForm;
