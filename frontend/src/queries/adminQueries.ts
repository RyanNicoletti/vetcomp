import { CompensationDetailsWithPages } from "../../../shared-types/types";
import { SortParams } from "../components/compensationtable/types";

interface UserWithCompensations {
  id: string;
  email: string;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  compensations: any[];
}

export const deleteCompensationById = async (id: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/admin/compensations/${id}`,
    { method: "DELETE", credentials: "include" }
  );
  const responseData = await response.json();
  if (!response.ok) {
    throw {
      status: response.status,
      message: responseData.message,
      errors: responseData.errors,
    };
  }
  return;
};

export const verifyCompensationById = async (id: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/admin/compensations/${id}/verify`,
    { method: "PATCH", credentials: "include" }
  );
  const responseData = await response.json();
  if (!response.ok) {
    throw {
      status: response.status,
      message: responseData.message,
      errors: responseData.errors,
    };
  }
  return;
};

export const approveCompensationById = async (id: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/admin/compensations/${id}/approve`,
    { method: "PATCH", credentials: "include" }
  );
  const responseData = await response.json();
  if (!response.ok) {
    throw {
      status: response.status,
      message: responseData.message,
      errors: responseData.errors,
    };
  }
  return;
};

export const getCompensationsAdmin = async (
  page: number,
  rowsPerPage: number,
  sortParams: SortParams
): Promise<CompensationDetailsWithPages> => {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/admin/compensations?page=${page}&rowsPerPage=${rowsPerPage}&sortDirection=${
      sortParams.sortDirection
    }&sortBy=${sortParams.sortBy}`,
    { method: "GET", credentials: "include" }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch compensation data.");
  }
  const salaryData: CompensationDetailsWithPages = await response.json();
  return salaryData;
};

export const getUsersWithCompensations = async (): Promise<
  UserWithCompensations[]
> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/admin/users`,
    { method: "GET", credentials: "include" }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch users data.");
  }
  return response.json();
};
