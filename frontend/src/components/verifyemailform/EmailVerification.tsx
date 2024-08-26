import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyEmail } from "../../queries/usersQueries";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { getAuthStatus } from "../../queries/authQueries";

interface IVerificationFormInput {
  verificationCode: string;
}

export const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, userId } = location.state as { email: string; userId: string };
  const queryClient = useQueryClient();

  const { data: isAuthenticated } = useQuery({
    queryKey: ["isAuthenticated"],
    queryFn: () => getAuthStatus(),
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<IVerificationFormInput>({
    defaultValues: {
      verificationCode: "",
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      queryClient.setQueryData(["isAuthenticated"], true);
      navigate("/");
    },
    onError: (error: any) => {
      setError("verificationCode", {
        type: "manual",
        message: "Invalid or expired verification code.",
      });
      queryClient.setQueryData(["isAuthenticated"], false);
    },
  });

  const onSubmit: SubmitHandler<IVerificationFormInput> = (data) => {
    verifyEmailMutation.mutate({
      userId,
      verificationCode: data.verificationCode,
    });
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Verify Your Email
      </Typography>
      <Typography variant="body1" paragraph>
        We've sent a verification code to {email}. Please enter it below.
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="verificationCode"
          control={control}
          rules={{
            required: "Verification code is required",
            minLength: { value: 4, message: "Code must be 4 characters" },
            maxLength: { value: 4, message: "Code must be 4 characters" },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Verification Code"
              fullWidth
              margin="normal"
              error={!!errors.verificationCode}
              helperText={errors.verificationCode?.message}
              inputProps={{ maxLength: 4 }}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={verifyEmailMutation.isPending}>
          {verifyEmailMutation.isPending ? "Verifying..." : "Verify Email"}
        </Button>
      </form>
    </Box>
  );
};
