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
    marketPosition: "below" | "average" | "above";
  };
  aiSummary?: string;
}

export const getSalaryComparison = async (
  compensationId?: string
): Promise<SalaryComparisonResult> => {
  const url = new URL(
    `${import.meta.env.VITE_API_BASE_URL}/compensations/comparison`
  );

  if (compensationId) {
    url.searchParams.append("compensationId", compensationId);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        "Failed to fetch salary comparison data. Please ensure you have submitted compensation information with your account."
    );
  }

  return await response.json();
};
