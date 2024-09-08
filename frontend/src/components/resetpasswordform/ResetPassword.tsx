import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import "./ResetPassword.css";
import { resetPassword } from "../../queries/usersQueries";

interface PasswordResetFormInputs {
  password: string;
  confirmPassword: string;
}

export const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [resetSuccess, setResetSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<PasswordResetFormInputs>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { password: string; token: string }) =>
      resetPassword(data),
    onSuccess: () => {
      setResetSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    },
    onError: (error: any) => {
      if (error.message) {
        setError("root", { type: "manual", message: error.message });
      } else {
        setError("root", {
          type: "manual",
          message: "An unexpected error occurred. Please try again.",
        });
      }
    },
  });

  const onSubmit = (data: PasswordResetFormInputs) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }
    resetPasswordMutation.mutate({
      password: data.password,
      token: token || "",
    });
  };

  if (resetSuccess) {
    return (
      <Box className="password-reset-container">
        <Typography variant="h6" className="success-message">
          Your password has been successfully reset. Redirecting to login
          page...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="password-reset-container">
      <Typography variant="h4" gutterBottom>
        Reset Your Password
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} className="password-reset-form">
        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters long",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Confirm New Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          )}
        />
        {errors.root && (
          <Typography color="error" className="error-message">
            {errors.root.message}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          className="submit-button"
          disabled={
            resetPasswordMutation.isPending || resetPasswordMutation.isSuccess
          }>
          {resetPasswordMutation.isPending ? (
            <CircularProgress size={24} />
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </Box>
  );
};
