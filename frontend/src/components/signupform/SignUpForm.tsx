import { Button, TextField, Typography } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import "./SignUpForm.css";
import { Link } from "react-router-dom";
import { ISignUpFormInput } from "./types";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../queries/usersQueries";

export const SignUpForm = () => {
  const { control, handleSubmit, watch, setValue, setError } =
    useForm<ISignUpFormInput>({
      defaultValues: {
        email: "",
        password: "",
        confirmPassword: "",
      },
    });

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
        // TODO Handle general error
        console.error("An unexpected error occurred:", error);
      }
    },
    onSuccess: async () => {
      console.log("success");
    },
  });

  const onSubmit: SubmitHandler<ISignUpFormInput> = (
    newUserData: ISignUpFormInput
  ) => {
    console.log(newUserData);
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
            rules={{ required: "password is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
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
            rules={{ required: "please confirm your password" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="confirm password"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </div>
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
