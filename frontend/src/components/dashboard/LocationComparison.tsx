import { useState, useEffect } from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getLocationCompensations } from "../../queries/compensationQueries";
import { ICompensation } from "../../../../shared-types/types";
import { moneyFormatter } from "../../utils/moneyFormatter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import "./LocationComparison.css";

interface LocationComparisonProps {
  userCompensations: ICompensation[];
  selectedLocation: string | null;
  onLocationChange: (location: string) => void;
}

interface CompensationChartData {
  id: string;
  company: string;
  title: string;
  years: number;
  yourComp: number;
  otherComp: number;
  specialization?: string;
  practiceType?: string;
}

export const LocationComparison: React.FC<LocationComparisonProps> = ({
  userCompensations,
  selectedLocation,
  onLocationChange,
}) => {
  const [chartData, setChartData] = useState<CompensationChartData[]>([]);
  const [userLocations, setUserLocations] = useState<string[]>([]);

  // Extract unique locations from user compensations
  useEffect(() => {
    if (userCompensations) {
      const locations = [
        ...new Set(userCompensations.map((comp) => comp.location)),
      ];
      setUserLocations(locations);
    }
  }, [userCompensations]);

  // Fetch compensations for the selected location
  const { data: locationCompensations, isLoading } = useQuery({
    queryKey: ["locationCompensations", selectedLocation],
    queryFn: () => getLocationCompensations(selectedLocation || ""),
    enabled: !!selectedLocation,
  });

  // Prepare data for chart when location compensations load
  useEffect(() => {
    if (locationCompensations && selectedLocation) {
      // Get user compensations for this location
      const userLocationCompensations = userCompensations.filter(
        (comp) => comp.location === selectedLocation
      );

      // Create a map to organize by years of experience
      const dataByYears: Record<number, any> = {};

      // Process user compensations
      userLocationCompensations.forEach((comp) => {
        const totalComp =
          comp.payment_frequency === "annually"
            ? comp.total_compensation || 0
            : (comp.hourly_rate || 0) * 2080; // Approximate annual for hourly (40hrs * 52 weeks)

        if (!dataByYears[comp.years_of_experience]) {
          dataByYears[comp.years_of_experience] = {
            years: comp.years_of_experience,
            yourComp: totalComp,
            otherComp: 0,
            details: {
              user: {
                company: comp.company,
                title: comp.title,
                specialization: comp.is_specialist
                  ? comp.specialization
                  : undefined,
                practiceType: !comp.is_specialist
                  ? comp.type_of_practice
                  : undefined,
              },
              others: [],
            },
          };
        } else {
          // If multiple user compensations with same years, use the average
          const existing = dataByYears[comp.years_of_experience].yourComp;
          dataByYears[comp.years_of_experience].yourComp =
            (existing + totalComp) / 2;

          // Update details
          dataByYears[comp.years_of_experience].details.user = {
            company:
              dataByYears[comp.years_of_experience].details.user.company +
              `, ${comp.company}`,
            title:
              dataByYears[comp.years_of_experience].details.user.title +
              `, ${comp.title}`,
            specialization: comp.is_specialist
              ? comp.specialization
              : undefined,
            practiceType: !comp.is_specialist
              ? comp.type_of_practice
              : undefined,
          };
        }
      });

      // Process other compensations
      locationCompensations.forEach((comp) => {
        // Skip if this is a user compensation (avoid double counting)
        if (
          userLocationCompensations.some((userComp) => userComp.id === comp.id)
        ) {
          return;
        }

        const totalComp =
          comp.payment_frequency === "annually"
            ? comp.total_compensation || 0
            : (comp.hourly_rate || 0) * 2080;

        if (!dataByYears[comp.years_of_experience]) {
          dataByYears[comp.years_of_experience] = {
            years: comp.years_of_experience,
            yourComp: 0,
            otherComp: totalComp,
            details: {
              user: null,
              others: [
                {
                  company: comp.company,
                  title: comp.title,
                  specialization: comp.is_specialist
                    ? comp.specialization
                    : undefined,
                  practiceType: !comp.is_specialist
                    ? comp.type_of_practice
                    : undefined,
                  totalComp,
                },
              ],
            },
          };
        } else {
          // If already have others with same years, calculate average
          const otherCompData = dataByYears[comp.years_of_experience];

          // Calculate new average if there are existing other compensations
          if (otherCompData.otherComp > 0) {
            const otherCount = otherCompData.details.others.length;
            otherCompData.otherComp =
              (otherCompData.otherComp * otherCount + totalComp) /
              (otherCount + 1);
          } else {
            otherCompData.otherComp = totalComp;
          }

          // Add to details
          otherCompData.details.others.push({
            company: comp.company,
            title: comp.title,
            specialization: comp.is_specialist
              ? comp.specialization
              : undefined,
            practiceType: !comp.is_specialist
              ? comp.type_of_practice
              : undefined,
            totalComp,
          });
        }
      });

      // Convert to array and sort by years of experience
      const formattedData = Object.values(dataByYears)
        .sort((a, b) => a.years - b.years)
        .map((item, index) => ({
          ...item,
          id: `${item.years}_${index}`, // Ensure unique ID
        }));

      setChartData(formattedData);
    }
  }, [locationCompensations, selectedLocation, userCompensations]);

  const handleLocationChange = (event: SelectChangeEvent<string>) => {
    onLocationChange(event.target.value);
  };

  return (
    <div className="location-comparison-container">
      <div className="location-comparison-header">
        <Typography variant="h5" className="section-title">
          Compare Your Compensation
        </Typography>
        <FormControl className="location-dropdown">
          <InputLabel id="location-select-label">Select Location</InputLabel>
          <Select
            labelId="location-select-label"
            id="location-select"
            value={selectedLocation || ""}
            label="Select Location"
            onChange={handleLocationChange}>
            {userLocations.map((location) => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {isLoading ? (
        <div className="chart-loading">Loading comparison data...</div>
      ) : (
        <div className="chart-container">
          <CompensationChart
            data={chartData}
            selectedLocation={selectedLocation || ""}
          />
        </div>
      )}
    </div>
  );
};

// Custom tooltip component for the chart
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`${data.years} Years of Experience`}</p>

        {data.yourComp > 0 && (
          <div className="tooltip-section">
            <h4>Your Compensation</h4>
            <p>{moneyFormatter.format(data.yourComp)}</p>
            {data.details.user && (
              <>
                <p>Company: {data.details.user.company}</p>
                <p>Title: {data.details.user.title}</p>
                {data.details.user.specialization ? (
                  <p>Specialization: {data.details.user.specialization}</p>
                ) : data.details.user.practiceType ? (
                  <p>Practice Type: {data.details.user.practiceType}</p>
                ) : null}
              </>
            )}
          </div>
        )}

        {data.otherComp > 0 && (
          <div className="tooltip-section">
            <h4>Other Compensations</h4>
            <p>Average: {moneyFormatter.format(data.otherComp)}</p>
            <p>Count: {data.details.others.length} entries</p>
          </div>
        )}
      </div>
    );
  }

  return null;
};

// Compensation Bar Chart component
interface CompensationChartProps {
  data: CompensationChartData[];
  selectedLocation: string;
}

export const CompensationChart: React.FC<CompensationChartProps> = ({
  data,
  selectedLocation,
}) => {
  if (data.length === 0) {
    return (
      <div className="no-chart-data">
        <Typography variant="body1">
          No compensation data available for {selectedLocation}. Be the first to
          contribute!
        </Typography>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="years"
          label={{
            value: "Years of Experience",
            position: "bottom",
            offset: 20,
          }}
        />
        <YAxis
          tickFormatter={(value) => moneyFormatter.format(value)}
          label={{
            value: "Compensation (USD)",
            angle: -90,
            position: "left",
            offset: 15,
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="yourComp"
          name="Your Compensation"
          fill="#1976d2"
          barSize={30}
        />
        <Bar
          dataKey="otherComp"
          name="Other Compensations (Avg)"
          fill="#90caf9"
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
