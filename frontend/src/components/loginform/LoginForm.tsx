import { Button, TextField, Typography } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import "./LoginForm.css";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ILoginFormInput } from "./types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser } from "../../queries/usersQueries";
import { useUserStatus } from "../hooks/useUserStatus";

export const LoginForm = () => {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ILoginFormInput>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const { isAuthenticated } = useUserStatus();
  const queryClient = useQueryClient();

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
        setError("root.serverError", {
          type: "manual",
          message: error.message || "Invalid email or password.",
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
    loginUserMutation.mutate(userData);
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

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
            rules={{ required: "Email is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </div>
        <div className="login-input">
          <Controller
            name="password"
            control={control}
            rules={{ required: "Password is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
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
          id="login-button"
          disabled={loginUserMutation.isPending}>
          Log in
        </Button>
        <p className="password-reset">I forgot my password</p>
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
};
