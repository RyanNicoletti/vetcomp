import {
  CompensationDetailsWithPages,
  ICompensation,
  ICompFormInput,
} from "../../../shared-types/types";
import { SortParams } from "../components/compensationtable/types";

interface FilterState {
  companySearch: string;
  locationSearch: string;
  practiceTypeFilter: string[];
  specialistsOnly: boolean;
}

export const getAllCompensations = async (): Promise<ICompensation[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/compensations/all`,
    { method: "GET", credentials: "include" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch all compensations data");
  }

  return await response.json();
};

export const getPaginatedCompensations = async (
  page: number,
  rowsPerPage: number,
  sortParams: SortParams,
  filters: FilterState
): Promise<CompensationDetailsWithPages> => {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/compensations?page=${page}&rowsPerPage=${rowsPerPage}&sortDirection=${
      sortParams.sortDirection
    }&sortBy=${sortParams.sortBy}&companySearch=${encodeURIComponent(
      filters.companySearch
    )}&locationSearch=${encodeURIComponent(
      filters.locationSearch
    )}&practiceType=${filters.practiceTypeFilter.join(",")}&specialistsOnly=${
      filters.specialistsOnly
    }`,
    { method: "GET", credentials: "include" }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch salaries.");
  }
  const salaryData: CompensationDetailsWithPages = await response.json();
  return salaryData;
};

export const getLocationCompensations = async (
  location: string
): Promise<ICompensation[]> => {
  // Normalize the location to handle potential format differences
  const normalizedLocation = normalizeLocation(location);

  // If we have a state abbreviation, search for it directly
  const searchParam =
    extractStateFromLocation(normalizedLocation) || normalizedLocation;

  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/compensations/by-location?location=${encodeURIComponent(searchParam)}`,
    { method: "GET", credentials: "include" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch location compensations.");
  }

  const data = await response.json();
  return data.compensations;
};

// Helper function to normalize location strings
export const normalizeLocation = (location: string): string => {
  return location.trim().toUpperCase();
};

// Helper function to extract state from location string
export const extractStateFromLocation = (location: string): string | null => {
  // Check for common formats like "City, TX" or "City, Texas"
  const stateRegex = /,\s*([A-Z]{2})$/;
  const match = location.match(stateRegex);

  if (match && match[1]) {
    return match[1]; // Return just the state code
  }

  // Check for full state names
  const stateNameMap: Record<string, string> = {
    ALABAMA: "AL",
    ALASKA: "AK",
    ARIZONA: "AZ",
    ARKANSAS: "AR",
    CALIFORNIA: "CA",
    COLORADO: "CO",
    CONNECTICUT: "CT",
    DELAWARE: "DE",
    FLORIDA: "FL",
    GEORGIA: "GA",
    HAWAII: "HI",
    IDAHO: "ID",
    ILLINOIS: "IL",
    INDIANA: "IN",
    IOWA: "IA",
    KANSAS: "KS",
    KENTUCKY: "KY",
    LOUISIANA: "LA",
    MAINE: "ME",
    MARYLAND: "MD",
    MASSACHUSETTS: "MA",
    MICHIGAN: "MI",
    MINNESOTA: "MN",
    MISSISSIPPI: "MS",
    MISSOURI: "MO",
    MONTANA: "MT",
    NEBRASKA: "NE",
    NEVADA: "NV",
    "NEW HAMPSHIRE": "NH",
    "NEW JERSEY": "NJ",
    "NEW MEXICO": "NM",
    "NEW YORK": "NY",
    "NORTH CAROLINA": "NC",
    "NORTH DAKOTA": "ND",
    OHIO: "OH",
    OKLAHOMA: "OK",
    OREGON: "OR",
    PENNSYLVANIA: "PA",
    "RHODE ISLAND": "RI",
    "SOUTH CAROLINA": "SC",
    "SOUTH DAKOTA": "SD",
    TENNESSEE: "TN",
    TEXAS: "TX",
    UTAH: "UT",
    VERMONT: "VT",
    VIRGINIA: "VA",
    WASHINGTON: "WA",
    "WEST VIRGINIA": "WV",
    WISCONSIN: "WI",
    WYOMING: "WY",
  };

  // Check if the location contains a state name
  for (const [stateName, stateCode] of Object.entries(stateNameMap)) {
    if (location.includes(stateName)) {
      return stateCode;
    }
  }

  return null;
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
      error: responseData.error,
    };
  }

  return responseData;
};

export const getCompensationById = async (
  compId: string
): Promise<ICompensation> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/compensations/${compId}`,
    { method: "GET", credentials: "include" }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch compensation");
  }
  return response.json();
};

export const updateCompensation = async ({
  compId,
  data,
}: {
  compId: string;
  data: ICompFormInput;
}) => {
  const formData = new FormData();
  if (data.verificationDocument && data.verificationDocument.length > 0) {
    formData.append("verificationDocument", data.verificationDocument[0]);
    data = { ...data, verificationDocument: data.verificationDocument[0] };
  }
  formData.append("updatedCompensation", JSON.stringify(data));

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/compensations/${compId}`,
    {
      method: "PUT",
      body: formData,
      credentials: "include",
    }
  );
  const responseData = await response.json();

  if (!response.ok) {
    throw {
      error: responseData.error,
    };
  }

  return responseData;
};

export const getUsersCompensation = async (): Promise<ICompensation[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/compensations/profile`,
    { method: "GET", credentials: "include" }
  );
  if (!response.ok) {
    throw new Error("Unable to get compensation data");
  }
  const data = response.json();
  return data;
};

export const uploadVerificationDocument = async ({
  compId,
  file,
}: {
  compId: string;
  file: File;
}): Promise<ICompensation> => {
  const formData = new FormData();
  formData.append("verificationDocument", file);

  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/compensations/${compId}/upload-verification`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to upload");
  }

  const data = await response.json();
  return data.data;
};
