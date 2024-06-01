import {
  useForm,
  Controller,
  SubmitHandler,
  useController,
} from "react-hook-form";
import {
  Autocomplete,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { NumericFormat } from "react-number-format";
import "./CompForm.css";
import { useEffect, useState } from "react";
import { getLocationSuggestions } from "../../queries/locationQueries";
import { useQuery } from "@tanstack/react-query";

interface ICompFormInput {
  company: string;
  title: string;
  typeOfPractice: string;
  isNewGrad: boolean;
  yearsOfExperience: number;
  location: string;
  baseSalary: number;
  hourlyRate: number;
  paymentFrequency: string;
  averageAnnualBonus: number;
  signOnBonus: number;
  averageAnnualProduction: number;
  percentProduction: number;
  totalCompensation: number;
  gender: string;
  userId: number;
  isVerified: boolean;
  isApproved: boolean;
  verificationDocument: Blob[];
  verificationDocumentName: string;
}

export const CompForm = () => {
  const { control, handleSubmit, watch, setValue } = useForm<ICompFormInput>({
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
      userId: 0,
      isVerified: false,
      isApproved: false,
      verificationDocument: [],
      verificationDocumentName: "",
    },
  });
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
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

  const handleLocationChange = (event: any, value: any) => {
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

      <Controller
        name="paymentFrequency"
        control={control}
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
            />
          )}
        />
      )}

      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  );
};
