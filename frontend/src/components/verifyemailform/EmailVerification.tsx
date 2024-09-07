import { useLocation, useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyEmail } from "../../queries/usersQueries";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useUserStatus } from "../../hooks/useUserStatus";
import "./EmailVerification.css";

interface IVerificationFormInput {
  verificationCode: string;
}

export const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, token } = location.state as { email: string; token: string };
  const queryClient = useQueryClient();
  const { isAuthenticated } = useUserStatus();

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
    onSuccess: (data) => {
      queryClient.setQueryData(["userStatus"], {
        isAuthenticated: data.isAuthenticated,
        isAdmin: data.isAdmin,
      });
      navigate("/");
    },
    onError: (_error: any) => {
      setError("verificationCode", {
        type: "manual",
        message: "Invalid or expired verification code.",
      });
      queryClient.invalidateQueries({ queryKey: ["userStatus"] });
    },
  });

  const onSubmit: SubmitHandler<IVerificationFormInput> = (data) => {
    verifyEmailMutation.mutate({
      token,
      verificationCode: data.verificationCode,
    });
  };

  return (
    <Box className="verify-email-form-container">
      <Typography variant="h4" gutterBottom>
        Verify Your Email
      </Typography>
      <Typography paragraph className="verify-instructions">
        We've sent a verification code to{" "}
        <span className="email-address">{email}</span>.{" "}
        <span className="enter-below">Please enter it below.</span>
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} className="verify-email-form">
        <Controller
          name="verificationCode"
          control={control}
          rules={{
            required: "Verification code is required",
            minLength: { value: 6, message: "Code must be 6 characters" },
            maxLength: { value: 6, message: "Code must be 6 characters" },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              className="verify-input"
              label="Verification Code"
              fullWidth
              margin="normal"
              error={!!errors.verificationCode}
              helperText={errors.verificationCode?.message}
              inputProps={{ maxLength: 6 }}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={verifyEmailMutation.isPending}>
          {verifyEmailMutation.isPending ? "Verifying..." : "Verify Email"}
        </Button>
      </form>
    </Box>
  );
};
