import { Button, TextField, Typography } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import "./SignUpForm.css";
import { Link, useNavigate } from "react-router-dom";
import { ISignUpFormInput } from "./types";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../queries/usersQueries";

export const SignUpForm = () => {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<ISignUpFormInput>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password: string = watch("password");
  const email: string = watch("email");

  const registerUserMutation = useMutation({
    mutationFn: registerUser,
    onError: (error: any) => {
      if (error.errors) {
        error.errors.forEach((err: { field: string; message: string }) => {
          setError(err.field as keyof ISignUpFormInput, {
            type: "manual",
            message: err.message,
          });
        });
      } else {
        setError("root.serverError", {
          type: "manual",
          message: error.message || "Invalid email or password.",
        });
      }
    },
    onSuccess: async (data: any) => {
      navigate("/verify-email", { state: { email, token: data.token } });
    },
  });

  const onSubmit: SubmitHandler<ISignUpFormInput> = (
    newUserData: ISignUpFormInput
  ) => {
    registerUserMutation.mutate(newUserData);
  };

  return (
    <div className="sign-up-container">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="sign-up-form">
        <Typography className="sign-up-form-title" variant="h6">
          Sign Up
        </Typography>
        <div className="signup-input" id="top-input">
          <Controller
            name="email"
            control={control}
            rules={{ required: "email is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="email"
                label="email"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </div>
        <div className="signup-input">
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
              maxLength: {
                value: 64,
                message: "Password must not exceed 64 characters",
              },
              validate: (value: string) =>
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])[A-Za-z\d@$!%*?&.,]*$/.test(
                  value
                ) ||
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="password"
                label="password"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </div>
        <div className="signup-input">
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Please confirm your password",
              validate: (value: string) =>
                value === password || "Passwords do not match",
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="password"
                label="confirm password"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </div>
        {errors.root?.serverError && (
          <Typography
            color="error"
            style={{ marginBottom: "10px", textAlign: "center" }}>
            {errors.root.serverError.message}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          id="signup-button">
          Sign Up
        </Button>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};
