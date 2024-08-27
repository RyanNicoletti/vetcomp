import { ILoginFormInput } from "../components/loginform/types";
import { ISignUpFormInput } from "../components/signupform/types";

interface IVerifyEmailParams {
  userId: string;
  verificationCode: string;
}

export const registerUser = async (userData: ISignUpFormInput) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
    credentials: "include",
  });
  const responseData = await response.json();
  if (!response.ok) {
    throw {
      status: response.status,
      message: responseData.message,
      errors: responseData.errors,
    };
  }
  return responseData;
};

export const loginUser = async (user: ILoginFormInput) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
    credentials: "include",
  });
  const responseData = await response.json();
  if (!response.ok) {
    throw {
      status: response.status,
      message: responseData.message,
      errors: responseData.errors,
    };
  }
  return responseData;
};

export const verifyEmail = async ({
  token,
  verificationCode,
}: {
  token: string;
  verificationCode: string;
}) => {
  console.log(token);
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/verify-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, verificationCode }),
      credentials: "include",
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
};

export const logoutUser = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "An unexpected error occurred");
  }
  return data;
};
