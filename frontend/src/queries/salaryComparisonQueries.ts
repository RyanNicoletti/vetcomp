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
  userCompensations: any[];
  insights: {
    competitiveAdvantage: string;
    improvementAreas: string[];
    marketPosition: "below" | "average" | "above";
  };
}

export const getSalaryComparison =
  async (): Promise<SalaryComparisonResult> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/compensations/comparison`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          "Failed to fetch salary comparison data. Please ensure you have submitted compensation information with your account."
      );
    }

    return await response.json();
  };
