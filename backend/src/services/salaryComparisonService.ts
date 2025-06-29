import { Knex } from "knex";
import { ICompensation } from "../../../shared-types/types";
import aiSummaryService from "./aiSummaryService";

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
  aiSummary?: string; // Optional in case AI service fails
}

const calculateMetrics = (
  salaries: number[],
  userSalary: number
): ComparisonMetrics => {
  if (salaries.length === 0) {
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
      recommendations: ["Insufficient data for comparison"],
    };
  }

  const sortedSalaries = [...salaries].sort((a, b) => a - b);
  const mean = salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length;

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

  // Fix the user percentile calculation
  const lowerCount = sortedSalaries.filter((sal) => sal < userSalary).length;
  const equalCount = sortedSalaries.filter((sal) => sal === userSalary).length;
  const userPercentile = Math.round(
    ((lowerCount + equalCount / 2) / sortedSalaries.length) * 100
  );

  // No recommendations anymore - keep it simple
  const recommendations: string[] = [];

  return {
    userSalary,
    marketData: {
      mean: Math.round(mean),
      median: Math.round(median),
      percentile25: Math.round(percentile25),
      percentile75: Math.round(percentile75),
      count: salaries.length,
    },
    userPercentile,
    recommendations,
  };
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

    const userAnnualSalary =
      selectedUserComp.payment_frequency === "hourly"
        ? (selectedUserComp.hourly_rate || 0) * 40 * 52
        : selectedUserComp.total_compensation ||
          selectedUserComp.base_salary ||
          0;

    const allCompensations = await db<ICompensation>("salaries")
      .select("*")
      .where({ is_approved: true })
      .whereNot({ user_id: userId });

    const allAnnualSalaries = allCompensations
      .map((comp) => {
        if (comp.payment_frequency === "hourly") {
          return (comp.hourly_rate || 0) * 40 * 52;
        }
        return comp.total_compensation || comp.base_salary || 0;
      })
      .filter((salary) => salary > 0);

    const overall = calculateMetrics(allAnnualSalaries, userAnnualSalary);

    const locationCompensations = allCompensations.filter((comp) => {
      const userLocation = selectedUserComp.location.toLowerCase();
      const compLocation = comp.location.toLowerCase();

      const getUserState = (location: string) => {
        const parts = location.split(",");
        return parts.length > 1 ? parts[parts.length - 1].trim() : "";
      };

      const userState = getUserState(userLocation);
      const compState = getUserState(compLocation);

      return userState === compState || userLocation === compLocation;
    });

    const locationSalaries = locationCompensations
      .map((comp) =>
        comp.payment_frequency === "hourly"
          ? (comp.hourly_rate || 0) * 40 * 52
          : comp.total_compensation || comp.base_salary || 0
      )
      .filter((salary) => salary > 0);

    const byLocation = calculateMetrics(locationSalaries, userAnnualSalary);

    const practiceTypeCompensations = allCompensations.filter(
      (comp) =>
        comp.type_of_practice?.toLowerCase() ===
        selectedUserComp.type_of_practice?.toLowerCase()
    );

    const practiceTypeSalaries = practiceTypeCompensations
      .map((comp) =>
        comp.payment_frequency === "hourly"
          ? (comp.hourly_rate || 0) * 40 * 52
          : comp.total_compensation || comp.base_salary || 0
      )
      .filter((salary) => salary > 0);

    const byPracticeType = calculateMetrics(
      practiceTypeSalaries,
      userAnnualSalary
    );

    const userExperience = selectedUserComp.years_of_experience || 0;
    const experienceCompensations = allCompensations.filter((comp) => {
      const compExperience = comp.years_of_experience || 0;
      return Math.abs(compExperience - userExperience) <= 2;
    });

    const experienceSalaries = experienceCompensations
      .map((comp) =>
        comp.payment_frequency === "hourly"
          ? (comp.hourly_rate || 0) * 40 * 52
          : comp.total_compensation || comp.base_salary || 0
      )
      .filter((salary) => salary > 0);

    const byExperience = calculateMetrics(experienceSalaries, userAnnualSalary);

    // Simplified insights - no more competitive advantage or improvement areas
    const insights = {
      marketPosition: (overall.userPercentile >= 60
        ? "above"
        : overall.userPercentile >= 40
        ? "average"
        : "below") as "below" | "average" | "above",
    };

    // Generate AI summary with raw compensation data
    let aiSummary: string | undefined;
    try {
      aiSummary = await aiSummaryService.getSalarySummary(
        db,
        userId,
        selectedUserComp.id,
        {
          userCompensation: selectedUserComp,
          allCompensations,
          locationCompensations,
          practiceTypeCompensations,
          experienceCompensations,
          calculatedMetrics: {
            userPercentile: overall.userPercentile,
            marketMedian: overall.marketData.median,
            locationPercentile: byLocation.userPercentile,
            practiceTypePercentile: byPracticeType.userPercentile,
            experiencePercentile: byExperience.userPercentile,
          },
        }
      );
    } catch (error) {
      console.error("Failed to get raw data AI summary:", error);
      // aiSummary remains undefined, component will handle gracefully
    }

    return {
      overall,
      byLocation,
      byPracticeType,
      byExperience,
      userCompensations,
      insights,
      aiSummary,
    };
  },
};

export default salaryComparisonService;
