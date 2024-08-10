import { ICompensation, ICompFormInput } from "../../../shared-types/types";

export const validateCompensationFormData = (
  data: ICompFormInput
): ICompensation => {
  const errors: Record<string, string> = {};
  const result: Partial<ICompensation> = {};

  const isEmptyString = (val: string): boolean => {
    if (val.trim() === "") {
      return true;
    }
    return false;
  };

  const parseNumber = (fieldName: string, val: string): number | null => {
    if (val.length === 0) {
      errors[fieldName] = `${fieldName} is required.`;
    }
    const num: number = Number(val.replace(/[^0-9.-]+/g, ""));
    if (isNaN(num)) {
      errors[
        fieldName
      ] = `Invalid input for ${fieldName}, must be a valid number.`;
      return null;
    }
  };
};
