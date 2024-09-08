import { Box, Button, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { sendPasswordResetEmail } from "../../queries/usersQueries";
import "./ForgotPasswordEmailVerification.css";
import { useState } from "react";

interface IForgotPasswordInput {
  email: string;
}

export const ForgotPasswordEmailVerification = () => {
  const [resetPasswordEmailSent, setResetPasswordEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<IForgotPasswordInput>({
    defaultValues: {
      email: "",
    },
  });

  const sendResetEmailMutation = useMutation({
    mutationFn: sendPasswordResetEmail,
    onError: (error: any) => {
      if (error.errors) {
        error.errors.forEach((err: { field: string; message: string }) => {
          setError(err.field as keyof IForgotPasswordInput, {
            type: "manual",
            message: err.message,
          });
        });
      } else {
        setError("root.serverError", {
          type: "manual",
          message: error.message || "Failed to verify email. Please try again.",
        });
      }
    },
    onSuccess: () => {
      setResetPasswordEmailSent(true);
    },
  });

  const onSubmit: SubmitHandler<IForgotPasswordInput> = (data) => {
    sendResetEmailMutation.mutate(data);
  };

  if (resetPasswordEmailSent) {
    return (
      <Box className="password-reset-container">
        <Typography variant="h6" className="success-message">
          Please check your email and follow the provided instructions to reset
          your password...
        </Typography>
      </Box>
    );
  }

  return (
    <div className="forgot-password-container">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="forgot-password-form">
        <Typography className="forgot-password-form-title" variant="h6">
          Verify Email
        </Typography>
        <Typography variant="body2" className="forgot-password-instructions">
          Enter your email address and we'll send you a link to reset your
          password.
        </Typography>
        <div className="forgot-password-input">
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
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
        {errors.root?.serverError && (
          <Typography color="error" className="server-error-message">
            {errors.root.serverError.message}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className="submit-button"
          disabled={sendResetEmailMutation.isPending}>
          {sendResetEmailMutation.isPending ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </div>
  );
};
