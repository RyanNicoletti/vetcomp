import { AlertColor, Button, TextField, Typography } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import "./LoginForm.css";
import { Link, useNavigate } from "react-router-dom";
import { ILoginFormInput } from "./types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginUser } from "../../queries/usersQueries";
import { getAuthStatus } from "../../queries/authQueries";
import { useState } from "react";
import CustomSnackbar from "../snackbar/Snackbar";

export const LoginForm = () => {
  const { control, handleSubmit, watch, setValue, setError } =
    useForm<ILoginFormInput>({
      defaultValues: {
        email: "",
        password: "",
      },
    });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as AlertColor,
    onClose: () => {},
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: isAuthenticated } = useQuery({
    queryKey: ["isAuthenticated"],
    queryFn: () => getAuthStatus(),
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
        setSnackbar({
          open: true,
          message: error.message || "Error logging in, please try again.",
          severity: "error" as AlertColor,
          onClose: () => {},
        });
      }
      queryClient.setQueryData(["isAuthenticated"], false);
    },
    onSuccess: async () => {
      queryClient.setQueryData(["isAuthenticated"], true);
      navigate("/");
    },
  });

  const onSubmit: SubmitHandler<ILoginFormInput> = (
    userData: ILoginFormInput
  ) => {
    console.log(userData);
    loginUserMutation.mutate(userData);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};
