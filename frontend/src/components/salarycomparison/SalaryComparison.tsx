import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Paper,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useQuery } from "@tanstack/react-query";
import { moneyFormatter } from "../../utils/moneyFormatter";
import "./SalaryComparison.css";
import { getSalaryComparison } from "../../queries/salaryComparisonQueries";

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

const PercentileBar: React.FC<{ percentile: number; label: string }> = ({
  percentile,
  label,
}) => {
  const getColor = (p: number) => {
    if (p >= 75) return "success";
    if (p >= 50) return "primary";
    if (p >= 25) return "warning";
    return "error";
  };

  const getIcon = (p: number) => {
    if (p >= 60) return <TrendingUpIcon color="success" />;
    if (p >= 40) return <TrendingFlatIcon color="primary" />;
    return <TrendingDownIcon color="error" />;
  };

  return (
    <Box className="percentile-bar">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={1}>
        <Typography variant="body2" fontWeight="medium">
          {label}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {getIcon(percentile)}
          <Typography variant="body2" fontWeight="bold">
            {percentile}th percentile
          </Typography>
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentile}
        color={getColor(percentile)}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};

const MetricsCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  metrics: ComparisonMetrics;
  isLoading?: boolean;
}> = ({ title, icon, metrics, isLoading = false }) => {
  const { userSalary, marketData, userPercentile, recommendations } = metrics;

  if (isLoading) {
    return (
      <Card className="metrics-card">
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {icon}
            <Typography variant="h6">{title}</Typography>
          </Box>
          <Box textAlign="center" py={4}>
            <Typography>Loading...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="metrics-card">
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          {icon}
          <Typography variant="h6">{title}</Typography>
        </Box>

        {marketData.count === 0 ? (
          <Alert severity="info">
            Not enough data available for this comparison
          </Alert>
        ) : (
          <>
            <PercentileBar percentile={userPercentile} label="Your Position" />

            <Box className="salary-metrics" mt={2}>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <Paper className="metric-item" elevation={0}>
                  <Typography variant="body2" color="textSecondary">
                    Your Salary
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {moneyFormatter.format(userSalary)}
                  </Typography>
                </Paper>
                <Paper className="metric-item" elevation={0}>
                  <Typography variant="body2" color="textSecondary">
                    Market Median
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {moneyFormatter.format(marketData.median)}
                  </Typography>
                </Paper>
                <Paper className="metric-item" elevation={0}>
                  <Typography variant="body2" color="textSecondary">
                    25th Percentile
                  </Typography>
                  <Typography variant="body1">
                    {moneyFormatter.format(marketData.percentile25)}
                  </Typography>
                </Paper>
                <Paper className="metric-item" elevation={0}>
                  <Typography variant="body2" color="textSecondary">
                    75th Percentile
                  </Typography>
                  <Typography variant="body1">
                    {moneyFormatter.format(marketData.percentile75)}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </>
        )}
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  // Existing error state for standalone usage
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

  // Type guard to ensure we have the required properties
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

        {comparisonData.aiSummary && (
          <Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {comparisonData.aiSummary}
              </Typography>
            </Alert>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{
                display: "block",
                textAlign: "right",
                mt: 0.5,
                fontStyle: "italic",
                fontSize: "0.75rem",
              }}>
              Summary generated by AI
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
        gap={3}>
        <MetricsCard
          title="Overall Market"
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
            conditions. Use this information as a general guide for salary
            discussions and career planning.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default SalaryComparison;
