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
  InputLabel,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
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
        isNewGrad: false,
        yearsOfExperience: undefined,
        location: "",
        baseSalary: 0,
        hourlyRate: 0,
        paymentFrequency: "",
        averageAnnualBonus: 0,
        signOnBonus: 0,
        averageAnnualProduction: 0,
        percentProduction: 0,
        totalCompensation: 0,
        gender: "",
        numberOfVeterinarians: 0,
        userId: 0,
        isVerified: false,
        isApproved: false,
        verificationDocument: [],
        verificationDocumentName: "",
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
      console.log("Uploaded file:", file);
      setIsFileUploaded(true);
      setUploadedFileName(file.name);
      setUploadedFile(file);
    }
  };

  const calculateTotalCompensation = () => {};

  const handleLocationChange = (_event: any, value: any) => {
    setValue("location", value || "");
  };

  const handleLocationInputChange: any = (event: any, value: string) => {
    setLocationQuery(event?.target.value || value);
  };

  const paymentFrequency = watch("paymentFrequency");
  const isNewGrad = watch("isNewGrad");

  const typeOfPracticeOptions = ["General Practice", "Specialty", "Consulting"];
  const paymentFrequencyOptions: string[] = ["Annual", "Hourly"];

  const onSubmit: SubmitHandler<ICompFormInput> = (data: ICompFormInput) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <Typography variant="h6">Company Information</Typography>

      <Controller
        name="company"
        control={control}
        rules={{ required: "Company is required" }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Company"
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
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
                label="Location"
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
            label="Title"
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="typeOfPractice"
        control={control}
        rules={{ required: "This field is required" }}
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel>Type of Practice</InputLabel>
            <Select {...field} label="Type of Practice">
              {typeOfPracticeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      <FormGroup row>
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
        <Controller
          name="yearsOfExperience"
          control={control}
          rules={{ required: "Years of Experience is required" }}
          render={({ field, fieldState }) => (
            <NumericFormat
              {...field}
              label="Years of Experience"
              customInput={TextField}
              value={isNewGrad ? 0 : field.value}
              disabled={isNewGrad}
              thousandSeparator={false}
              isNumericString
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </FormGroup>

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
                <NumericFormat
                  {...field}
                  label="Base Salary"
                  fullWidth
                  customInput={TextField}
                  thousandSeparator={true}
                  prefix={"$"}
                  decimalScale={2}
                  fixedDecimalScale={true}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  disabled={isFileUploaded}
                />
              )}
            />
          )}

          {paymentFrequency === "Hourly" && (
            <Controller
              name="hourlyRate"
              control={control}
              rules={{ required: "Hourly Rate is required" }}
              render={({ field, fieldState }) => (
                <NumericFormat
                  {...field}
                  label="Hourly Rate"
                  fullWidth
                  customInput={TextField}
                  thousandSeparator={true}
                  prefix={"$"}
                  decimalScale={2}
                  fixedDecimalScale={true}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  disabled={isFileUploaded}
                />
              )}
            />
          )}

          <Box className="additional-comp-btns">
            <Button
              type="button"
              variant="contained"
              size="small"
              onClick={() => setShowSignOnBonus(!showSignOnBonus)}>
              {showSignOnBonus ? "Hide Sign On Bonus" : "Add Sign On Bonus"}
            </Button>
            <Button
              type="button"
              variant="contained"
              size="small"
              onClick={() => setShowPercentProduction(!showPercentProduction)}>
              {showPercentProduction
                ? "Hide % of Production"
                : "Add % of Production"}
            </Button>
            <Button
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
            accept=".pdf,.doc,.docx"
            style={{ display: "none" }}
            id="verification-file-upload"
            type="file"
            onChange={handleFileUpload}
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

      <Typography variant="h6">Optional Values</Typography>

      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Gender" fullWidth />
        )}
      />

      <Controller
        name="numberOfVeterinarians"
        control={control}
        render={({ field, fieldState }) => (
          <NumericFormat
            {...field}
            label="Number of Veterinarians in Practice"
            fullWidth
            customInput={TextField}
            thousandSeparator={true}
            isNumericString
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  );
};
