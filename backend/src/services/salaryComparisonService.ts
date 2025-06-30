import { Knex } from "knex";
import { ICompensation } from "../../../shared-types/types";

interface ComparisonMetrics {
  userSalary: number;
  marketData: {
    mean: number;
    median: number;
    percentile25: number;
    percentile75: number;
    count: number;
  };
  userPercentile: number;
  recommendations: string[];
  isHourly: boolean;
}

interface SalaryComparisonResult {
  overall: ComparisonMetrics;
  byLocation: ComparisonMetrics;
  byPracticeType: ComparisonMetrics;
  byExperience: ComparisonMetrics;
  userCompensations: ICompensation[];
  insights: {
    marketPosition: "below" | "average" | "above";
  };
}

const calculateMetrics = (
  salaries: number[],
  userSalary: number,
  isHourly: boolean = false
): ComparisonMetrics => {
  const validSalaries = salaries.filter(
    (salary) =>
      salary != null && !isNaN(salary) && isFinite(salary) && salary > 0
  );

  if (validSalaries.length === 0) {
    return {
      userSalary,
      marketData: {
        mean: 0,
        median: 0,
        percentile25: 0,
        percentile75: 0,
        count: 0,
      },
      userPercentile: 50,
      recommendations: [],
      isHourly,
    };
  }

  const sortedSalaries = [...validSalaries].sort((a, b) => a - b);
  const mean =
    validSalaries.reduce((sum, sal) => sum + sal, 0) / validSalaries.length;

  const getPercentile = (arr: number[], percentile: number): number => {
    const index = (percentile / 100) * (arr.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (upper >= arr.length) return arr[arr.length - 1];
    return arr[lower] * (1 - weight) + arr[upper] * weight;
  };

  const median = getPercentile(sortedSalaries, 50);
  const percentile25 = getPercentile(sortedSalaries, 25);
  const percentile75 = getPercentile(sortedSalaries, 75);

  const lowerCount = sortedSalaries.filter((sal) => sal < userSalary).length;
  const equalCount = sortedSalaries.filter((sal) => sal === userSalary).length;
  const userPercentile = Math.round(
    ((lowerCount + equalCount / 2) / sortedSalaries.length) * 100
  );

  return {
    userSalary,
    marketData: {
      mean: isHourly ? Math.round(mean * 100) / 100 : Math.round(mean),
      median: isHourly ? Math.round(median * 100) / 100 : Math.round(median),
      percentile25: isHourly
        ? Math.round(percentile25 * 100) / 100
        : Math.round(percentile25),
      percentile75: isHourly
        ? Math.round(percentile75 * 100) / 100
        : Math.round(percentile75),
      count: validSalaries.length,
    },
    userPercentile,
    recommendations: [],
    isHourly,
  };
};

const convertToNumber = (value: any): number => {
  if (value == null) return 0;
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  return isNaN(num) ? 0 : num;
};

const salaryComparisonService = {
  async getUserSalaryComparison(
    db: Knex,
    userId: string,
    compensationId?: string
  ): Promise<SalaryComparisonResult | null> {
    const userCompensations = await db<ICompensation>("salaries")
      .select("*")
      .where({ user_id: userId, is_approved: true });

    if (userCompensations.length === 0) {
      return null;
    }

    let selectedUserComp: ICompensation;

    if (compensationId) {
      const specificComp = userCompensations.find(
        (comp) => comp.id === compensationId
      );
      if (!specificComp) {
        return null;
      }
      selectedUserComp = specificComp;
    } else {
      selectedUserComp = userCompensations.sort(
        (a, b) =>
          new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      )[0];
    }

    const isUserHourly = selectedUserComp.payment_frequency === "hourly";
    const userCompensation = isUserHourly
      ? convertToNumber(selectedUserComp.hourly_rate)
      : convertToNumber(selectedUserComp.total_compensation);

    const allCompensations = await db<ICompensation>("salaries")
      .select("*")
      .where({ is_approved: true })
      .whereNot({ user_id: userId });

    const allCompensationValues = allCompensations
      .filter(
        (comp) => comp.payment_frequency === selectedUserComp.payment_frequency
      )
      .map((comp) => {
        if (comp.payment_frequency === "hourly") {
          return convertToNumber(comp.hourly_rate);
        }
        return convertToNumber(comp.total_compensation);
      })
      .filter(
        (compensation) =>
          compensation != null &&
          !isNaN(compensation) &&
          isFinite(compensation) &&
          compensation > 0
      );

    const overall = calculateMetrics(
      allCompensationValues,
      userCompensation,
      isUserHourly
    );

    const locationCompensations = allCompensations.filter((comp) => {
      const userLocation = selectedUserComp.location.toLowerCase();
      const compLocation = comp.location.toLowerCase();

      const getState = (location: string) => {
        const parts = location.split(",");
        return parts.length > 1
          ? parts[parts.length - 1].trim()
          : location.trim();
      };

      const userState = getState(userLocation);
      const compState = getState(compLocation);

      return (
        userState === compState &&
        userState !== "" &&
        comp.payment_frequency === selectedUserComp.payment_frequency
      );
    });

    const locationValues = locationCompensations
      .map((comp) =>
        comp.payment_frequency === "hourly"
          ? convertToNumber(comp.hourly_rate)
          : convertToNumber(comp.total_compensation)
      )
      .filter((compensation) => compensation > 0);

    const byLocation = calculateMetrics(
      locationValues,
      userCompensation,
      isUserHourly
    );

    const practiceTypeCompensations = allCompensations.filter(
      (comp) =>
        comp.type_of_practice?.toLowerCase() ===
          selectedUserComp.type_of_practice?.toLowerCase() &&
        comp.payment_frequency === selectedUserComp.payment_frequency
    );

    const practiceTypeValues = practiceTypeCompensations
      .map((comp) =>
        comp.payment_frequency === "hourly"
          ? convertToNumber(comp.hourly_rate)
          : convertToNumber(comp.total_compensation)
      )
      .filter((compensation) => compensation > 0);

    const byPracticeType = calculateMetrics(
      practiceTypeValues,
      userCompensation,
      isUserHourly
    );

    const userExperience = convertToNumber(
      selectedUserComp.years_of_experience
    );
    const experienceCompensations = allCompensations.filter((comp) => {
      const compExperience = convertToNumber(comp.years_of_experience);
      return (
        Math.abs(compExperience - userExperience) <= 2 &&
        comp.payment_frequency === selectedUserComp.payment_frequency
      );
    });

    const experienceValues = experienceCompensations
      .map((comp) =>
        comp.payment_frequency === "hourly"
          ? convertToNumber(comp.hourly_rate)
          : convertToNumber(comp.total_compensation)
      )
      .filter((compensation) => compensation > 0);

    const byExperience = calculateMetrics(
      experienceValues,
      userCompensation,
      isUserHourly
    );

    const insights = {
      marketPosition: (overall.userPercentile >= 60
        ? "above"
        : overall.userPercentile >= 40
        ? "average"
        : "below") as "below" | "average" | "above",
    };

    return {
      overall,
      byLocation,
      byPracticeType,
      byExperience,
      userCompensations,
      insights,
    };
  },
};

export default salaryComparisonService;
