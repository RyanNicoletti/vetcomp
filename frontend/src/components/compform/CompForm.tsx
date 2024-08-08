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
  Link,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachmentIcon from "@mui/icons-material/Attachment";
import { NumericFormat } from "react-number-format";
import "./CompForm.css";
import { ChangeEvent, useEffect, useState } from "react";
import { getLocationSuggestions } from "../../queries/locationQueries";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ICompFormInput } from "./types";
import {
  generalPracticeOptions,
  paymentFrequencyOptions,
  specialistOptions,
} from "./CompFormData";

export const CompForm = () => {
  const { control, handleSubmit, watch, setValue, formState } =
    useForm<ICompFormInput>({
      defaultValues: {
        company: "",
        title: "",
        typeOfPractice: "",
        isSpecialist: false,
        specialization: "",
        isNewGrad: false,
        yearsOfExperience: undefined,
        location: "",
        baseSalary: undefined,
        hourlyRate: undefined,
        paymentFrequency: "",
        averageAnnualBonus: undefined,
        signOnBonus: undefined,
        averageAnnualProduction: undefined,
        percentProduction: undefined,
        totalCompensation: 0,
        gender: "",
        numberOfVeterinarians: undefined,
        isVerified: false,
        isApproved: false,
        verificationDocument: undefined,
        verificationDocumentName: "",
        daysWorkedPerWeek: undefined,
        email: undefined,
      },
    });

  const [locationQuery, setLocationQuery] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [showSignOnBonus, setShowSignOnBonus] = useState(false);
  const [showPercentProduction, setShowPercentProduction] = useState(false);
  const [showAverageAnnualProduction, setShowAverageAnnualProduction] =
    useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [uploadFile, setUploadFile] = useState(false);
  const [selectManual, setSelectManual] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSpecialist, setIsSpecialist] = useState(false);

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
    mutationFn: async (data: ICompFormInput) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/salaries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const addCompResponse = await response.json();
      return addCompResponse;
    },
    onSuccess: async () => {
      console.log("success");
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

  const handleManualSalaryInfo = () => {
    setUploadFile(false);
    setSelectManual(true);
    setUploadedFileName(null);
    setUploadedFile(null);
    setIsFileUploaded(false);
  };

  const handleUploadFile = () => {
    setUploadFile(true);
    setSelectManual(false);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsFileUploaded(true);
      setUploadedFileName(file.name);
      setUploadedFile(file);
      setValue("verificationDocument", [file]);
      setValue("verificationDocumentName", file.name);
    }
  };

  const calculateTotalCompensation = () => {};

  const handleLocationChange = (_event: any, value: any) => {
    setValue("location", value || "");
  };

  const handleLocationInputChange: any = (event: any, value: string) => {
    setLocationQuery(event?.target.value || value);
  };

  const handleIsNewGrad = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setValue("isNewGrad", true);
      setValue("yearsOfExperience", 0);
    } else {
      setValue("isNewGrad", false);
    }
  };

  const paymentFrequency: string = watch("paymentFrequency");
  const isNewGrad: boolean = watch("isNewGrad");

  const onSubmit: SubmitHandler<ICompFormInput> = async (
    data: ICompFormInput
  ) => {
    addCompensationMutation.mutate(data);
  };

  return (
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
            <Typography gutterBottom>Company or Hospital Name</Typography>
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
            <Typography gutterBottom>
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
            <Typography gutterBottom>Job Title</Typography>
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
              {(isSpecialist ? specialistOptions : generalPracticeOptions).map(
                (option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                )
              )}
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
                <Typography gutterBottom>Years of Experience</Typography>
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

      <Typography variant="h6" className="section-title">
        Salary Information
      </Typography>

      <Box className="salary-info-container">
        <Button
          className="salary-info-btn"
          onClick={() => handleManualSalaryInfo()}
          variant="contained"
          color="primary"
          fullWidth>
          Fill out manually
        </Button>
        <Button
          className="salary-info-btn"
          onClick={() => handleUploadFile()}
          variant="contained"
          color="primary"
          fullWidth>
          Upload verification
        </Button>
      </Box>

      {selectManual && (
        <>
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
                      disabled={isFileUploaded}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}
          />

          {paymentFrequency === "Annual" && (
            <Controller
              name="baseSalary"
              control={control}
              rules={{ required: "Base Salary is required" }}
              render={({ field, fieldState }) => {
                const { ref, ...rest } = field;
                return (
                  <Box>
                    <Typography gutterBottom>Base Salary</Typography>
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
                      disabled={isFileUploaded}
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
                    <Typography gutterBottom>Hourly Rate</Typography>
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
                      disabled={isFileUploaded}
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
                    <Typography gutterBottom>Sign On Bonus</Typography>
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
                    <Typography gutterBottom>
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
                    <Typography gutterBottom>
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
                      onValueChange={calculateTotalCompensation}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  </Box>
                );
              }}
            />
          )}
        </>
      )}
      {uploadFile && (
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
              Upload
            </Button>
          </label>
          {uploadedFileName && (
            <Box className="uploaded-file-info">
              <AttachmentIcon />
              <Link
                href={uploadedFile ? URL.createObjectURL(uploadedFile) : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="uploaded-file-link">
                {uploadedFileName}
              </Link>
            </Box>
          )}
        </Box>
      )}

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
              <Typography gutterBottom>Average days worked per week</Typography>
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
            <Typography gutterBottom>Gender</Typography>
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
              <Typography gutterBottom>
                Number of Veterinarians in Practice
              </Typography>
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
        rules={{
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        }}
        render={({ field, fieldState }) => (
          <Box>
            <Typography gutterBottom>Email</Typography>
            <TextField
              {...field}
              fullWidth
              error={!!fieldState.error}
              helperText={
                fieldState.error?.message ||
                "Your email will not be shared. Required if you wish to have your compensation details associated with an account."
              }
            />
          </Box>
        )}
      />

      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  );
};
