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
  FormLabel,
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
import { useQuery } from "@tanstack/react-query";
import { ICompFormInput } from "./types";

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
        percentProduction: 0,
        totalCompensation: 0,
        gender: null,
        numberOfVeterinarians: undefined,
        userId: 0,
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

  const paymentFrequency: string = watch("paymentFrequency");
  const isNewGrad: boolean = watch("isNewGrad");

  const generalPracticeOptions: string[] = [
    "Small animal",
    "Large animal",
    "Equine",
    "Mixed animal",
    "Dairy",
    "Exotics",
    "Research: industry",
    "Research: government",
    "Other",
  ];

  const specialistOptions: string[] = [
    "Anesthesia and Analgesia",
    "Behavior",
    "Dentistry",
    "Dermatology",
    "Emergency and Critical Care",
    "Internal Medicine, small animal",
    "Internal Medicine, large animal",
    "Laboratory Animal Medicine",
    "Microbiology",
    "Nutrition",
    "Ophthalmology",
    "Pathology",
    "Pharmacology",
    "Preventive Medicine",
    "Radiology",
    "Sports Medicine and Rehabilitation",
    "Surgery, small animal",
    "Surgery, large animal",
    "Theriogenology",
    "Toxicology",
    "Veterinary Practitioners",
    "Zoological Medicine",
  ];
  const paymentFrequencyOptions: string[] = ["Annual", "Hourly"];

  const onSubmit: SubmitHandler<ICompFormInput> = (data: ICompFormInput) => {
    console.log(data);
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
            <Typography variant="body2" align="left" gutterBottom>
              Company or Hospital Name
            </Typography>
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
            <Typography variant="body2" align="left" gutterBottom>
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
              noOptionsText="Please ensure format is 'City, two letter state code' or 'City, Country Code'"
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
            <Typography variant="body2" align="left" gutterBottom>
              Job Title
            </Typography>
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
          render={({ field, fieldState }) => (
            <Box className="yoe-input-container">
              <Typography variant="body2" align="left" gutterBottom>
                Years of Experience
              </Typography>
              <NumericFormat
                {...field}
                customInput={TextField}
                placeholder="0"
                value={isNewGrad ? 0 : field.value}
                disabled={isNewGrad}
                thousandSeparator={false}
                isNumericString
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            </Box>
          )}
        />

        <Controller
          name="isNewGrad"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} />}
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
              <>
                <FormLabel>Payment Frequency</FormLabel>
                <FormGroup row>
                  {paymentFrequencyOptions.map((option) => (
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
              </>
            )}
          />

          {paymentFrequency === "Annual" && (
            <Controller
              name="baseSalary"
              control={control}
              rules={{ required: "Base Salary is required" }}
              render={({ field, fieldState }) => (
                <Box>
                  <Typography variant="body2" align="left" gutterBottom>
                    Base Salary
                  </Typography>
                  <NumericFormat
                    {...field}
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
              )}
            />
          )}

          {paymentFrequency === "Hourly" && (
            <Controller
              name="hourlyRate"
              control={control}
              rules={{ required: "Hourly Rate is required" }}
              render={({ field, fieldState }) => (
                <Box>
                  <Typography variant="body2" align="left" gutterBottom>
                    Hourly Rate
                  </Typography>
                  <NumericFormat
                    {...field}
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
              )}
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
              render={({ field, fieldState }) => (
                <NumericFormat
                  className="sign-on-bonus"
                  {...field}
                  label="Sign On Bonus"
                  fullWidth
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
          )}

          {showPercentProduction && (
            <Controller
              name="percentProduction"
              control={control}
              render={({ field, fieldState }) => (
                <NumericFormat
                  {...field}
                  label="% of Production That Goes Towards Your Salary"
                  fullWidth
                  customInput={TextField}
                  thousandSeparator={true}
                  suffix={"%"}
                  decimalScale={2}
                  fixedDecimalScale={true}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          )}

          {showAverageAnnualProduction && (
            <Controller
              name="averageAnnualProduction"
              control={control}
              render={({ field, fieldState }) => (
                <NumericFormat
                  {...field}
                  label="Average Annual Production"
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
              )}
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
        render={({ field, fieldState }) => (
          <Box>
            <Typography variant="body2" align="left" gutterBottom>
              Average days worked per week
            </Typography>
            <NumericFormat
              customInput={TextField}
              {...field}
              isNumericString
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          </Box>
        )}
      />

      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <Box>
            <Typography variant="body2" align="left" gutterBottom>
              Gender
            </Typography>
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
        render={({ field, fieldState }) => (
          <Box>
            <Typography variant="body2" align="left" gutterBottom>
              Number of Veterinarians in Practice
            </Typography>
            <NumericFormat
              {...field}
              customInput={TextField}
              isNumericString
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
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
