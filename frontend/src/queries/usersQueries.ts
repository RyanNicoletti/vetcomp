import { ILoginFormInput } from "../components/loginform/types";
import { ISignUpFormInput } from "../components/signupform/types";

export const registerUser = async (userData: ISignUpFormInput) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  const newUser = await response.json();
  return newUser;
};

export const loginUser = async (user: ILoginFormInput) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  const authenticatedUser = await response.json();
  return authenticatedUser;
};
