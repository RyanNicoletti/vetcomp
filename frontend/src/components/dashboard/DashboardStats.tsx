import React, { useMemo } from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BusinessIcon from "@mui/icons-material/Business";
import { ICompensation } from "../../../../shared-types/types";
import { moneyFormatter } from "../../utils/moneyFormatter";
import "./DashboardStats.css";

interface DashboardStatsProps {
  compensations: ICompensation[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  compensations
}) => {
  const stats = useMemo(() => {
    let totalCompensation = 0;
    compensations.forEach((comp) => {
      if (comp.payment_frequency === "annually" && comp.total_compensation) {
        totalCompensation += comp.total_compensation;
      } else if (comp.hourly_rate) {
        totalCompensation += comp.hourly_rate * 40 * 52;
      }
    });

    const avgCompensation =
      compensations.length > 0 ? totalCompensation / compensations.length : 0;

    const uniqueCompanies = new Set(compensations.map((comp) => comp.company));

    return {
      avgCompensation,
      companiesCount: uniqueCompanies.size
    };
  }, [compensations]);

  const StatCard = ({
    icon,
    value,
    label,
    color = "#1976d2",
  }: {
    icon: React.ReactNode;
    value: React.ReactNode;
    label: string;
    color?: string;
  }) => (
    <Paper
      elevation={1}
      className="stat-card"
      style={{ borderTopColor: color }}>
      <Box className="stat-card-header">
        <Box className="stat-card-icon" style={{ color }}>
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="h5" component="div" className="stat-card-value">
        {value}
      </Typography>
    </Paper>
  );

  return (
    <Box className="dashboard-stats-container">
      <Typography variant="h5" className="section-title" gutterBottom>
        Your Dashboard Summary
      </Typography>
      <Divider className="dashboard-divider" />

      <div className="stats-grid">
        <div className="stat-item">
          <StatCard
            icon={<AttachMoneyIcon fontSize="large" />}
            value={moneyFormatter.format(stats.avgCompensation)}
            label="Average Compensation"
            color="#2e7d32"
          />
        </div>

        <div className="stat-item">
          <StatCard
            icon={<BusinessIcon fontSize="large" />}
            value={stats.companiesCount}
            label="Companies"
            color="#1976d2"
          />
        </div>
      </div>
    </Box>
  );
};

export default DashboardStats;
