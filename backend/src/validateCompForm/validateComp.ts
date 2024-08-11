import { ICompensation, ICompFormInput } from "../../../shared-types/types";
import { validate } from "./validateEmail";

interface ValidationError {
  field: string;
  message: string;
}

export const validateCompensationFormData = (
  formData: ICompFormInput
): { data: ICompensation | null; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];
  const data: Partial<ICompensation> = {};

  if (typeof formData.company !== "string" || formData.company.trim() === "") {
    errors.push({ field: "company", message: "Invalid input." });
  } else {
    data.company = formData.company.trim();
  }

  if (
    typeof formData.location !== "string" ||
    formData.location.trim() === ""
  ) {
    errors.push({ field: "location", message: "Invalid input for location." });
  } else {
    data.location = formData.location.trim();
  }

  if (typeof formData.title !== "string" || formData.title.trim() === "") {
    errors.push({ field: "title", message: "Invalid input." });
  } else {
    data.title = formData.title.trim();
  }

  if (typeof formData.isSpecialist !== "boolean") {
    errors.push({ field: "isSpecialist", message: "Invalid input." });
  } else {
    data.is_specialist = formData.isSpecialist;
  }

  if (formData.isSpecialist === true) {
    if (
      typeof formData.specialization !== "string" ||
      formData.specialization.trim() === ""
    ) {
      errors.push({ field: "specialization", message: "Invalid input." });
    } else {
      data.specialization = formData.specialization.trim();
      data.type_of_practice = null;
    }
  } else if (formData.isSpecialist === false) {
    if (
      typeof formData.typeOfPractice !== "string" ||
      formData.typeOfPractice.trim() === ""
    ) {
      errors.push({ field: "typeOfPractice", message: "Invalid input." });
    } else {
      data.type_of_practice = formData.typeOfPractice.trim();
      data.specialization = null;
    }
  }

  if (typeof formData.isNewGrad !== "boolean") {
    errors.push({ field: "isNewGrad", message: "Invalid input." });
  } else {
    data.is_new_grad = formData.isNewGrad;
  }

  if (
    typeof formData.yearsOfExperience !== "string" ||
    formData.yearsOfExperience.trim() === ""
  ) {
    errors.push({ field: "yearsOfExperience", message: "Invalid input." });
  } else {
    const yearsOfExperience = parseInt(formData.yearsOfExperience, 10);
    if (isNaN(yearsOfExperience)) {
      errors.push({
        field: "yearsOfExperience",
        message: "Years of experience must be a valid number.",
      });
    } else {
      data.years_of_experience = yearsOfExperience;
    }
  }

  if (
    typeof formData.paymentFrequency !== "string" ||
    formData.paymentFrequency.trim() === ""
  ) {
    errors.push({ field: "paymentFrequency", message: "Invalid input." });
  } else {
    const frequency: string = formData.paymentFrequency.toLowerCase().trim();
    if (frequency === "annually") {
      data.payment_frequency = "annually";
      data.hourly_rate = null;
      data.verification_document = null;
      data.verification_document_name = null;
    } else if (frequency === "hourly") {
      data.payment_frequency = "hourly";
      data.base_salary = null;
      data.verification_document = null;
      data.verification_document_name = null;
    } else {
      errors.push({ field: "paymentFrequency", message: "Invalid input." });
    }
  }

  if (data.payment_frequency === "annually") {
    if (
      typeof formData.baseSalary !== "string" ||
      formData.baseSalary.trim() === ""
    ) {
      errors.push({ field: "baseSalary", message: "Invalid input." });
    } else {
      const baseSalary = parseFloat(
        formData.baseSalary.replace(/[^0-9.]+/g, "")
      );
      if (isNaN(baseSalary)) {
        errors.push({
          field: "baseSalary",
          message: "Base salary must be a valid number.",
        });
      } else {
        data.base_salary = baseSalary;
      }
    }
  } else if (data.payment_frequency === "hourly") {
    if (
      typeof formData.hourlyRate !== "string" ||
      formData.hourlyRate.trim() === ""
    ) {
      errors.push({ field: "hourlyRate", message: "Invalid input." });
    } else {
      const hourlyRate = parseFloat(
        formData.hourlyRate.replace(/[^0-9.]+/g, "")
      );
      if (isNaN(hourlyRate)) {
        errors.push({
          field: "hourlyRate",
          message: "Hourly rate must be a valid number.",
        });
      } else {
        data.hourly_rate = hourlyRate;
      }
    }
  }

  if (formData.signOnBonus !== undefined) {
    if (formData.signOnBonus.trim() === "") {
      data.sign_on_bonus = null;
    } else {
      const signOnBonus = parseFloat(
        formData.signOnBonus.replace(/[^0-9.]+/g, "")
      );
      if (isNaN(signOnBonus)) {
        errors.push({
          field: "signOnBonus",
          message: "Invalid input.",
        });
      } else {
        data.sign_on_bonus = signOnBonus;
      }
    }
  } else {
    data.sign_on_bonus = null;
  }

  if (formData.averageAnnualProduction !== undefined) {
    if (formData.averageAnnualProduction.trim() === "") {
      data.average_annual_production = null;
    } else {
      const avgAnnualProduction = parseFloat(
        formData.averageAnnualProduction.replace(/[^0-9.]+/g, "")
      );
      if (isNaN(avgAnnualProduction)) {
        errors.push({
          field: "averageAnnualProduction",
          message: "Invalid input.",
        });
      } else {
        data.average_annual_production = avgAnnualProduction;
      }
    }
  } else {
    data.average_annual_production = null;
  }

  if (formData.percentProduction !== undefined) {
    if (formData.percentProduction.trim() === "") {
      data.percent_production = null;
    } else {
      const percentProduction = parseFloat(
        formData.percentProduction.replace(/[^0-9.]+/g, "")
      );
      if (
        isNaN(percentProduction) ||
        percentProduction < 0 ||
        percentProduction > 100
      ) {
        errors.push({
          field: "percentProduction",
          message: "Percent production must be a number between 0 and 100.",
        });
      } else {
        data.percent_production = percentProduction;
      }
    }
  } else {
    data.percent_production = null;
  }

  if (formData.gender === "") {
    data.gender = null;
  } else if (["male", "female", "non-binary"].includes(formData.gender)) {
    data.gender = formData.gender;
  } else {
    errors.push({
      field: "gender",
      message: "Invalid input.",
    });
  }

  if (formData.numberOfVeterinarians !== undefined) {
    if (
      typeof formData.numberOfVeterinarians !== "string" ||
      formData.numberOfVeterinarians.trim() === ""
    ) {
      errors.push({
        field: "numberOfVeterinarians",
        message: "Invalid input.",
      });
    } else {
      const numVets = parseInt(formData.numberOfVeterinarians, 10);
      if (isNaN(numVets) || numVets < 1) {
        errors.push({
          field: "numberOfVeterinarians",
          message: "Number of veterinarians must be a valid positive number.",
        });
      } else {
        data.number_of_veterinarians = numVets;
      }
    }
  } else {
    data.number_of_veterinarians = null;
  }

  if (
    formData.verificationDocument &&
    formData.verificationDocument.length > 0
  ) {
    data.payment_frequency = null;
    data.base_salary = null;
    data.hourly_rate = null;
    data.sign_on_bonus = null;
    data.percent_production = null;
    data.average_annual_production = null;
    //  handle file conversion to Uint8Array elsewhere
    data.verification_document = new Uint8Array();
    data.verification_document_name = formData.verificationDocumentName || null;
  } else {
    data.verification_document = null;
    data.verification_document_name = null;
  }

  if (formData.daysWorkedPerWeek !== undefined) {
    if (
      typeof formData.daysWorkedPerWeek !== "string" ||
      formData.daysWorkedPerWeek.trim() === ""
    ) {
      errors.push({
        field: "daysWorkedPerWeek",
        message: "Invalid input.",
      });
    } else {
      const daysWorked = parseFloat(formData.daysWorkedPerWeek);
      if (isNaN(daysWorked) || daysWorked < 0 || daysWorked > 7) {
        errors.push({
          field: "daysWorkedPerWeek",
          message:
            "Days worked per week must be a valid number between 0 and 7.",
        });
      } else {
        data.days_worked_per_week = daysWorked;
      }
    }
  } else {
    data.days_worked_per_week = null;
  }

  if (formData.email !== undefined) {
    if (typeof formData.email !== "string") {
      errors.push({
        field: "email",
        message: "Invalid input.",
      });
    } else {
      const isValid = validate(formData.email);
      if (!isValid) {
        errors.push({
          field: "email",
          message: "Invalid input.",
        });
      } else {
        data.email = formData.email;
      }
    }
  } else {
    data.email = null;
  }

  // Set default values
  data.is_verified = false;
  data.is_approved = false;

  if (errors.length > 0) {
    return { data: null, errors };
  } else {
    return { data: data as ICompensation, errors: [] };
  }
};
