import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Alert, Card, CardContent } from "@mui/material";
import { getSalaryComparison } from "../../queries/salaryComparisonQueries";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ScheduleIcon from "@mui/icons-material/Schedule";
import "./SalaryComparison.css";

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
  userCompensations: any[];
  insights: {
    marketPosition: "below" | "average" | "above";
  };
}

interface MetricsCardProps {
  title: string;
  icon: React.ReactNode;
  metrics: ComparisonMetrics;
  isLoading?: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  icon,
  metrics,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="metrics-card">
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            {icon}
            <Typography variant="h6" ml={1}>
              {title}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            Loading comparison data...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (
    !metrics ||
    !metrics.marketData ||
    (!metrics.isHourly && metrics.marketData.count < 5)
  ) {
    return (
      <Card className="metrics-card">
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            {icon}
            <Typography variant="h6" ml={1}>
              {title}
            </Typography>
          </Box>
          <Alert severity="info">
            <Typography variant="body2">
              We're still gathering data for this comparison - check back soon
              as our community grows!
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isHourly = metrics.isHourly;
  const formatValue = (value: number) => {
    if (isHourly) {
      return `${value.toFixed(2)}/hr`;
    }
    return `${value.toLocaleString()}`;
  };

  const safeMarketData = {
    mean: metrics.marketData.mean || 0,
    median: metrics.marketData.median || 0,
    percentile25: metrics.marketData.percentile25 || 0,
    percentile75: metrics.marketData.percentile75 || 0,
  };

  return (
    <Card className="metrics-card">
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" ml={1}>
            {title}
          </Typography>
        </Box>

        <Box className="salary-metrics">
          <Typography variant="body2" color="textSecondary" mb={2}>
            Your Compensation:{" "}
            <strong>{formatValue(metrics.userSalary || 0)}</strong>
          </Typography>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <Box className="metric-item">
              <Typography variant="caption" color="textSecondary">
                Market Median
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatValue(safeMarketData.median)}
              </Typography>
            </Box>
            <Box className="metric-item">
              <Typography variant="caption" color="textSecondary">
                Market Mean
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatValue(safeMarketData.mean)}
              </Typography>
            </Box>
            <Box className="metric-item">
              <Typography variant="caption" color="textSecondary">
                25th Percentile
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatValue(safeMarketData.percentile25)}
              </Typography>
            </Box>
            <Box className="metric-item">
              <Typography variant="caption" color="textSecondary">
                75th Percentile
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatValue(safeMarketData.percentile75)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

interface SalaryComparisonProps {
  embedded?: boolean;
  compensationId?: string;
}

const SalaryComparison: React.FC<SalaryComparisonProps> = ({
  embedded = false,
  compensationId,
}) => {
  const {
    data: comparisonData,
    isLoading,
    isError,
    error,
  } = useQuery<SalaryComparisonResult>({
    queryKey: ["salaryComparison", compensationId],
    queryFn: () => getSalaryComparison(compensationId),
    staleTime: 5 * 60 * 1000,
  });

  if (embedded && (isLoading || isError)) {
    return null;
  }

  if (!embedded && isLoading) {
    return (
      <Box className="salary-comparison-container">
        <Typography variant="h4" gutterBottom>
          Analyzing Your Compensation...
        </Typography>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
          gap={3}>
          {[1, 2, 3, 4].map((i) => (
            <MetricsCard
              key={i}
              title="Loading..."
              icon={<ScheduleIcon />}
              metrics={{} as ComparisonMetrics}
              isLoading
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (!embedded && isError) {
    return (
      <Box className="salary-comparison-container">
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6">Unable to Generate Comparison</Typography>
          <Typography>
            {(error as any)?.message ||
              "Please ensure you have submitted compensation data with your account to use this feature."}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!comparisonData) {
    return (
      <Box className={embedded ? "" : "salary-comparison-container"}>
        <Alert severity="info">
          <Typography variant="h6">No Data Available</Typography>
          <Typography>
            Submit your compensation information to see how you compare to
            others in your field.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!comparisonData.overall) {
    return (
      <Box className={embedded ? "" : "salary-comparison-container"}>
        <Alert severity="error">
          <Typography variant="h6">Invalid Data</Typography>
          <Typography>
            Unable to process comparison data. Please try again later.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const { overall, byLocation, byPracticeType, byExperience } = comparisonData;

  return (
    <Box
      className={
        embedded ? "salary-comparison-embedded" : "salary-comparison-container"
      }>
      <Box className="comparison-header" mb={4}>
        <Typography variant={embedded ? "h5" : "h4"} gutterBottom>
          Your Salary Comparison Report
        </Typography>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
        gap={3}>
        <MetricsCard
          title="Overall"
          icon={<BusinessIcon color="primary" />}
          metrics={overall}
        />

        <MetricsCard
          title="By Location"
          icon={<LocationOnIcon color="primary" />}
          metrics={byLocation}
        />

        <MetricsCard
          title="By Practice Type"
          icon={<BusinessIcon color="primary" />}
          metrics={byPracticeType}
        />

        <MetricsCard
          title="By Experience Level"
          icon={<ScheduleIcon color="primary" />}
          metrics={byExperience}
        />
      </Box>

      <Box className="disclaimer" mt={3}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Disclaimer:</strong> This comparison is based on anonymous
            data submitted by veterinary professionals. Results may vary based
            on geographic location, specific role requirements, and market
            conditions.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default SalaryComparison;
