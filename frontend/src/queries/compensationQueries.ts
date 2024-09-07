import {
  CompensationDetailsWithPages,
  ICompFormInput,
} from "../../../shared-types/types";
import { SortParams } from "../components/compensationtable/types";

export const getAllSalaries = async (
  page: number,
  rowsPerPage: number,
  sortParams: SortParams
): Promise<CompensationDetailsWithPages> => {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/compensations?page=${page}&rowsPerPage=${rowsPerPage}&sortDirection=${
      sortParams.sortDirection
    }&sortBy=${sortParams.sortBy}`,
    { method: "GET", credentials: "include" }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch salaries.");
  }
  const salaryData: CompensationDetailsWithPages = await response.json();
  return salaryData;
};

export const createCompensation = async (data: ICompFormInput) => {
  const formData = new FormData();
  if (data.verificationDocument && data.verificationDocument.length > 0) {
    formData.append("verificationDocument", data.verificationDocument[0]);
    data = { ...data, verificationDocument: data.verificationDocument[0] };
  }
  formData.append("newCompensation", JSON.stringify(data));

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/compensations`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );
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
