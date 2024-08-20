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
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "An unexpeced error occured");
  }
  return data;
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
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "An unexpeced error occured");
  }
  return data;
};

export const verifyEmail = async ({
  userId,
  verificationCode,
}: IVerifyEmailParams) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/verify-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, verificationCode }),
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }

  return response.json();
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
