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
import { useUserStatus } from "../../hooks/useUserStatus";

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
    },
  });

  const [locationQuery, setLocationQuery] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [showSignOnBonus, setShowSignOnBonus] = useState(false);
  const [showPercentProduction, setShowPercentProduction] = useState(false);
  const [showAverageAnnualProduction, setShowAverageAnnualProduction] =
    useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSpecialist, setIsSpecialist] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { openSnackbar } = useSnackbar();
  const { isAuthenticated } = useUserStatus();

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

  const addCompensationMutation = useMutation({
    mutationFn: createCompensation,
    onError: (error: any) => {
      if (error.errors) {
        error.errors.forEach((err: { field: string; message: string }) => {
          setError(err.field as keyof ICompFormInput, {
            type: "manual",
            message: err.message,
          });
        });
      } else {
        setError("root.serverError", {
          type: "manual",
          message:
            error.message || "An unexpected error occurred. Please try again.",
        });
      }
    },
    onSuccess: async (data) => {
      navigate("/");
      openSnackbar(
        data.message ||
          "Success! Thank you for submitting your comp info. It will be reviewed as soon as possible.",
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

  const onSubmit: SubmitHandler<ICompFormInput> = async (
    data: ICompFormInput
  ) => {
    addCompensationMutation.mutateAsync(data);
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit(onSubmit)} className="form-container">
        <Typography className="section-title" variant="h6">
          Company Information
        </Typography>

        <Controller
          name="company"
          control={control}
          rules={{ required: "Company is required" }}
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
          name="location"
          control={control}
          rules={{
            required: "Location is required",
            validate: (value) => options.includes(value) || "Invalid location",
          }}
          render={({ field, fieldState }) => (
            <Box>
              <Typography>
                Location
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
          name={isSpecialist ? "specialization" : "typeOfPractice"}
          control={control}
          rules={{ required: "This field is required" }}
          render={({ field }) => (
            <FormControl fullWidth>
              <Select {...field} displayEmpty>
                <MenuItem value="" disabled>
                  Select {isSpecialist ? "specialization" : "type of practice"}
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
                      // field.onChange(e);
                      handleIsNewGrad(e);
                    }}
                  />
                }
                label="New Graduate"
              />
            )}
          />
        </Box>

        <Typography
          variant="h6"
          className="section-title"
          id="salaryInfoSection">
          Salary Information
        </Typography>

        <Controller
          name="paymentFrequency"
          control={control}
          rules={{ required: "Please select a payment frequency" }}
          render={({ field }) => (
            <Box className="payment-frequency-container">
              <Typography>Payment Frequency: </Typography>
              <FormGroup row className="payment-frequency-checkboxes">
                {paymentFrequencyOptions.map((option: string) => (
                  <FormControlLabel
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
            {showSignOnBonus ? "Hide Sign On Bonus" : "Add Sign On Bonus"}
          </Button>
          <Button
            className="additional-comp-btn"
            type="button"
            variant="contained"
            size="small"
            onClick={() => setShowPercentProduction(!showPercentProduction)}>
            {showPercentProduction
              ? "Hide % of Production"
              : "Add % of Production"}
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
              ? "Hide Average Annual Production"
              : "Add Average Annual Production"}
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
                    % Production
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
          Verification Document (Optional)
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
          Upload an offer letter or pay stub to have your compensation details
          verified. The document will be deleted after review and not stored
          permanently.
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
                  <MenuItem value="" disabled>
                    Select gender
                  </MenuItem>
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

        {!isAuthenticated && (
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Box>
                <Typography>Email</Typography>
                <TextField
                  {...field}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ||
                    "Your email will not be shared. Required if you want to have your compensation details linked to an account."
                  }
                />
              </Box>
            )}
          />
        )}
        <div className="submit-container">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="submit-button">
            Submit
          </Button>
        </div>
        {errors.root?.serverError && (
          <Typography
            color="error"
            style={{ marginBottom: "10px", textAlign: "center" }}>
            {errors.root.serverError.message}
          </Typography>
        )}
        {!isAuthenticated && (
          <Typography variant="body2" className="sign-up-link">
            Or, create an account first:{" "}
            <RouterLink to="/signup">Sign up here</RouterLink>
          </Typography>
        )}
      </form>
    </div>
  );
};
