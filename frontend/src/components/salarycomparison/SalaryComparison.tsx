import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useQuery } from "@tanstack/react-query";
import { moneyFormatter } from "../../utils/moneyFormatter";
import "./SalaryComparison.css";
import { getSalaryComparison } from "queries/salaryComparisonQueries";

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
  if (isLoading) {
    return (
      <Card className="metrics-card">
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            {icon}
            <Typography variant="h6">{title}</Typography>
          </Box>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  const { userSalary, marketData, userPercentile, recommendations } = metrics;

  return (
    <Card className="metrics-card">
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          {icon}
          <Typography variant="h6">{title}</Typography>
          <Chip
            label={`${marketData.count} samples`}
            size="small"
            variant="outlined"
          />
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

            {recommendations.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" fontWeight="medium" mb={1}>
                  Recommendations:
                </Typography>
                <List dense className="recommendations-list">
                  {recommendations.map((rec, index) => (
                    <ListItem key={index} className="recommendation-item">
                      <ListItemIcon>
                        <InfoIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={rec}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const SalaryComparison: React.FC = () => {
  const {
    data: comparisonData,
    isLoading,
    isError,
    error,
  } = useQuery<SalaryComparisonResult>({
    queryKey: ["salaryComparison"],
    queryFn: getSalaryComparison,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
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

  if (isError) {
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
      <Box className="salary-comparison-container">
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

  const { overall, byLocation, byPracticeType, byExperience, insights } =
    comparisonData;

  return (
    <Box className="salary-comparison-container">
      <Box className="comparison-header" mb={4}>
        <Typography variant="h4" gutterBottom>
          Your Salary Comparison Report
        </Typography>
        <Alert
          severity={
            insights.marketPosition === "above"
              ? "success"
              : insights.marketPosition === "average"
              ? "info"
              : "warning"
          }
          sx={{ mb: 2 }}>
          <Typography variant="h6">{insights.competitiveAdvantage}</Typography>
        </Alert>
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

      {insights.improvementAreas.length > 0 && (
        <Card className="insights-card" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <WarningIcon
                color="warning"
                sx={{ mr: 1, verticalAlign: "middle" }}
              />
              Areas for Potential Improvement
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {insights.improvementAreas.map((area, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={area} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

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
