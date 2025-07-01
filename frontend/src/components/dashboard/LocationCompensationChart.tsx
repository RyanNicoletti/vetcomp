import { useState, useEffect } from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from "@mui/material";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  getAllCompensations,
  getLocationCompensations,
} from "../../queries/compensationQueries";
import { ICompensation } from "../../../../shared-types/types";
import { moneyFormatter } from "../../utils/moneyFormatter";
import "./LocationComparison.css";

interface LocationCompensationChartProps {
  userCompensations: ICompensation[];
}

// List of US states for the dropdown
const stateOptions = [
  { label: "All Locations", value: "all" },
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
  { label: "Arizona", value: "AZ" },
  { label: "Arkansas", value: "AR" },
  { label: "California", value: "CA" },
  { label: "Colorado", value: "CO" },
  { label: "Connecticut", value: "CT" },
  { label: "Delaware", value: "DE" },
  { label: "Florida", value: "FL" },
  { label: "Georgia", value: "GA" },
  { label: "Hawaii", value: "HI" },
  { label: "Idaho", value: "ID" },
  { label: "Illinois", value: "IL" },
  { label: "Indiana", value: "IN" },
  { label: "Iowa", value: "IA" },
  { label: "Kansas", value: "KS" },
  { label: "Kentucky", value: "KY" },
  { label: "Louisiana", value: "LA" },
  { label: "Maine", value: "ME" },
  { label: "Maryland", value: "MD" },
  { label: "Massachusetts", value: "MA" },
  { label: "Michigan", value: "MI" },
  { label: "Minnesota", value: "MN" },
  { label: "Mississippi", value: "MS" },
  { label: "Missouri", value: "MO" },
  { label: "Montana", value: "MT" },
  { label: "Nebraska", value: "NE" },
  { label: "Nevada", value: "NV" },
  { label: "New Hampshire", value: "NH" },
  { label: "New Jersey", value: "NJ" },
  { label: "New Mexico", value: "NM" },
  { label: "New York", value: "NY" },
  { label: "North Carolina", value: "NC" },
  { label: "North Dakota", value: "ND" },
  { label: "Ohio", value: "OH" },
  { label: "Oklahoma", value: "OK" },
  { label: "Oregon", value: "OR" },
  { label: "Pennsylvania", value: "PA" },
  { label: "Rhode Island", value: "RI" },
  { label: "South Carolina", value: "SC" },
  { label: "South Dakota", value: "SD" },
  { label: "Tennessee", value: "TN" },
  { label: "Texas", value: "TX" },
  { label: "Utah", value: "UT" },
  { label: "Vermont", value: "VT" },
  { label: "Virginia", value: "VA" },
  { label: "Washington", value: "WA" },
  { label: "West Virginia", value: "WV" },
  { label: "Wisconsin", value: "WI" },
  { label: "Wyoming", value: "WY" },
];

const LocationCompensationChart = ({
  userCompensations,
}: LocationCompensationChartProps) => {
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [paymentType, setPaymentType] = useState<string>("annually");
  const [userChartData, setUserChartData] = useState<any[]>([]);
  const [otherChartData, setOtherChartData] = useState<any[]>([]);

  // Fetch all compensations
  const {
    data: allCompensations,
    isLoading: isAllCompLoading,
    isError: isAllCompError,
  } = useQuery({
    queryKey: ["allCompensations"],
    queryFn: getAllCompensations,
  });

  // Fetch location-specific compensations
  const {
    data: locationCompensations,
    isLoading: isLocationLoading,
    isError: isLocationError,
    refetch: refetchLocationData,
  } = useQuery({
    queryKey: ["locationCompensations", selectedLocation],
    queryFn: () =>
      selectedLocation === "all"
        ? Promise.resolve([])
        : getLocationCompensations(selectedLocation),
    enabled: selectedLocation !== "all",
  });

  // Update chart data when compensations change
  useEffect(() => {
    if (
      selectedLocation === "all" &&
      allCompensations &&
      userCompensations.length
    ) {
      prepareChartData(allCompensations, userCompensations);
    } else if (
      selectedLocation !== "all" &&
      locationCompensations &&
      userCompensations.length
    ) {
      prepareChartData(locationCompensations, userCompensations);
    }
  }, [
    selectedLocation,
    paymentType,
    allCompensations,
    locationCompensations,
    userCompensations,
  ]);

  // Handle location change
  const handleLocationChange = (event: any) => {
    setSelectedLocation(event.target.value);
    if (event.target.value !== "all") {
      refetchLocationData();
    }
  };

  // Handle payment type toggle
  const handlePaymentTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPaymentType: string
  ) => {
    if (newPaymentType !== null) {
      setPaymentType(newPaymentType);
    }
  };

  // Prepare chart data from raw compensations
  const prepareChartData = (
    compensations: ICompensation[],
    userComps: ICompensation[]
  ) => {
    // Filter compensations by payment type
    const filteredCompensations = compensations.filter(
      (comp) => comp.payment_frequency === paymentType
    );

    // Filter user compensations by payment type
    const filteredUserComps = userComps.filter(
      (comp) => comp.payment_frequency === paymentType
    );

    // Create arrays for user and other data
    const userData: any[] = [];
    const otherData: any[] = [];

    // Map compensations to chart data format
    filteredCompensations.forEach((comp) => {
      const isUserComp = filteredUserComps.some(
        (userComp) => userComp.id === comp.id
      );

      const dataPoint = {
        x: comp.years_of_experience,
        y:
          paymentType === "annually"
            ? Number(comp.total_compensation)
            : Number(comp.hourly_rate),
        z: isUserComp ? 160 : 130, // Make user dots slightly larger
        title: comp.title,
        company: comp.company,
        location: comp.location,
        specialization: comp.specialization,
        practice_type: comp.type_of_practice,
        isUser: isUserComp,
      };

      if (isUserComp) {
        userData.push(dataPoint);
      } else {
        otherData.push(dataPoint);
      }
    });

    setUserChartData(userData);
    setOtherChartData(otherData);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">{data.title}</p>
          <p className="tooltip-company">{data.company}</p>
          <p className="tooltip-location">{data.location}</p>
          <p className="tooltip-experience">
            Experience: {data.x} {data.x === 1 ? "year" : "years"}
          </p>
          <p className="tooltip-compensation">
            {paymentType === "annually" ? "Salary: " : "Hourly Rate: "}
            {moneyFormatter.format(data.y)}
          </p>
          {data.specialization && (
            <p className="tooltip-specialization">
              Specialization: {data.specialization}
            </p>
          )}
          {data.practice_type && (
            <p className="tooltip-practice-type">
              Practice Type: {data.practice_type}
            </p>
          )}
          {data.isUser && (
            <p className="tooltip-user-flag">This is your compensation</p>
          )}
        </div>
      );
    }
    return null;
  };

  const isLoading = isAllCompLoading || isLocationLoading;
  const isError = isAllCompError || isLocationError;
  const hasData = userChartData.length > 0 || otherChartData.length > 0;

  return (
    <div className="location-comp-chart-container">
      <div className="chart-header">
        <Typography variant="h5" className="section-title">
          Compensation Comparison
        </Typography>
        <div className="chart-controls">
          <FormControl className="location-dropdown">
            <InputLabel id="location-select-label">Location</InputLabel>
            <Select
              labelId="location-select-label"
              value={selectedLocation}
              label="Location"
              onChange={handleLocationChange}>
              {stateOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={paymentType}
            exclusive
            onChange={handlePaymentTypeChange}
            className="payment-toggle">
            <ToggleButton value="annually">Annual Salary</ToggleButton>
            <ToggleButton value="hourly">Hourly Rate</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>

      <div className="comp-chart-container">
        {isLoading ? (
          <div className="chart-loading">
            <CircularProgress size={40} />
            <Typography variant="body1" style={{ marginLeft: "1rem" }}>
              Loading compensation data...
            </Typography>
          </div>
        ) : isError ? (
          <div className="no-chart-data">
            <Typography variant="body1">
              Error loading compensation data. Please try again later.
            </Typography>
          </div>
        ) : !hasData ? (
          <div className="no-chart-data">
            <Typography variant="body1">
              No compensation data available for the selected criteria.
            </Typography>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="105%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                name="Years of Experience"
                unit=" years"
                type="number"
                domain={[0, "dataMax + 2"]}
              />
              <YAxis
                dataKey="y"
                name={
                  paymentType === "annually" ? "Annual Salary" : "Hourly Rate"
                }
                tickFormatter={(value) => moneyFormatter.format(value)}
                domain={
                  paymentType === "annually"
                    ? [0, "dataMax + 10000"]
                    : [0, "dataMax + 10"]
                }
              />
              <ZAxis dataKey="z" range={[40, 60]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Scatter
                name="Other Compensations"
                data={otherChartData}
                fill="#8884d8"
              />
              <Scatter
                name="Your Compensation"
                data={userChartData}
                fill="#ff7300" // Highlight user's data in orange
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default LocationCompensationChart;
