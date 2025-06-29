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
}

interface SalaryComparisonResult {
  overall: ComparisonMetrics;
  byLocation: ComparisonMetrics;
  byPracticeType: ComparisonMetrics;
  byExperience: ComparisonMetrics;
  userCompensations: ICompensation[];
  insights: {
    competitiveAdvantage: string;
    improvementAreas: string[];
    marketPosition: "below" | "average" | "above";
  };
}

const calculatePercentile = (value: number, sortedValues: number[]): number => {
  if (sortedValues.length === 0) return 0;

  const count = sortedValues.filter((v) => v <= value).length;
  return Math.round((count / sortedValues.length) * 100);
};

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
      userPercentile: 0,
      recommendations: ["Not enough data available for comparison"],
    };
  }

  const sorted = [...salaries].sort((a, b) => a - b);
  const mean = salaries.reduce((sum, val) => sum + val, 0) / salaries.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const percentile25 = sorted[Math.floor(sorted.length * 0.25)];
  const percentile75 = sorted[Math.floor(sorted.length * 0.75)];
  const userPercentile = calculatePercentile(userSalary, sorted);

  const recommendations: string[] = [];

  if (userPercentile < 25) {
    recommendations.push(
      "Your compensation is below market average - if you are looking for new opportunities, consider negotiating for higher compensation"
    );
  } else if (userPercentile < 50) {
    recommendations.push(
      "Your compensation is just below market median there may be room for improvement if you are looking for new opportunities"
    );
  } else if (userPercentile < 75) {
    recommendations.push("Your compensation is competitive and above average");
  } else {
    recommendations.push("Your compensation is excellent and in the top tier");
  }

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
    userId: string
  ): Promise<SalaryComparisonResult | null> {
    const userCompensations = await db<ICompensation>("salaries")
      .select("*")
      .where({ user_id: userId, is_approved: true });

    if (userCompensations.length === 0) {
      return null;
    }

    const latestUserComp = userCompensations.sort(
      (a, b) =>
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
    )[0];

    const userAnnualSalary =
      latestUserComp.payment_frequency === "hourly"
        ? (latestUserComp.hourly_rate || 0) * 40 * 52
        : latestUserComp.total_compensation || latestUserComp.base_salary || 0;

    const allCompensations = await db<ICompensation>("salaries")
      .select("*")
      .where({ is_approved: true })
      .whereNot({ user_id: userId }); // Exclude user's own data

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
      const userLocation = latestUserComp.location.toLowerCase();
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
        latestUserComp.type_of_practice?.toLowerCase()
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

    const experienceRange = 2;
    const experienceCompensations = allCompensations.filter(
      (comp) =>
        Math.abs(
          comp.years_of_experience - latestUserComp.years_of_experience
        ) <= experienceRange
    );

    const experienceSalaries = experienceCompensations
      .map((comp) =>
        comp.payment_frequency === "hourly"
          ? (comp.hourly_rate || 0) * 40 * 52
          : comp.total_compensation || comp.base_salary || 0
      )
      .filter((salary) => salary > 0);

    const byExperience = calculateMetrics(experienceSalaries, userAnnualSalary);

    const insights = {
      competitiveAdvantage:
        overall.userPercentile >= 75
          ? "You are in the top 25% of earners in your field"
          : overall.userPercentile >= 50
          ? "You earn above the median for your field"
          : overall.userPercentile >= 25
          ? "You earn below the median but above the bottom 25%"
          : "You are in the bottom 25% of earners in your field",

      improvementAreas: [
        ...(overall.userPercentile < 50
          ? [
              "Your compensation is below the market median for veterinary professionals",
            ]
          : []),
        ...(byLocation.userPercentile < 50
          ? ["Compensation in your area may be below regional averages"]
          : []),
        ...(byPracticeType.userPercentile < 50
          ? [
              "Your practice type may offer lower compensation compared to others",
            ]
          : []),
        ...(byExperience.userPercentile < 50
          ? ["Professionals with similar experience typically earn more"]
          : []),
        ...(overall.userPercentile >= 75
          ? ["You are earning competitively within your field"]
          : []),
      ],

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
