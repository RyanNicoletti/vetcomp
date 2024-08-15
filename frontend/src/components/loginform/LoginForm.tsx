import { Button, TextField, Typography } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import "./LoginForm.css";
import { Link } from "react-router-dom";
import { ILoginFormInput } from "./types";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../queries/usersQueries";

export const LoginForm = () => {
  const { control, handleSubmit, watch, setValue, setError } =
    useForm<ILoginFormInput>({
      defaultValues: {
        email: "",
        password: "",
      },
    });

  const loginUserMutation = useMutation({
    mutationFn: loginUser,
    onError: (error: any) => {
      if (error.errors) {
        error.errors.forEach((err: { field: string; message: string }) => {
          setError(err.field as keyof ILoginFormInput, {
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

  const onSubmit: SubmitHandler<ILoginFormInput> = (
    userData: ILoginFormInput
  ) => {
    console.log(userData);
    loginUserMutation.mutate(userData);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="login-form">
        <Typography className="login-form-title" variant="h6">
          Log in
        </Typography>
        <div className="login-input" id="top-input">
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
        <div className="login-input">
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          id="login-button">
          Log in
        </Button>
        <p className="password-reset">I forgot my password</p>
        <p>
          Dont have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
};
