import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  Switch,
  FormControlLabel,
  Collapse,
  Autocomplete,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import {
  normalizeLocation,
  extractStateFromLocation,
} from "../../queries/compensationQueries";

interface SearchAndFilterProps {
  onSearch: (filters: FilterState) => void;
  initialFilters: FilterState;
}

interface FilterState {
  companySearch: string;
  locationSearch: string;
  specialistsOnly: boolean;
}

// US States mapping
const stateOptions = [
  { label: "Alabama", code: "AL" },
  { label: "Alaska", code: "AK" },
  { label: "Arizona", code: "AZ" },
  { label: "Arkansas", code: "AR" },
  { label: "California", code: "CA" },
  { label: "Colorado", code: "CO" },
  { label: "Connecticut", code: "CT" },
  { label: "Delaware", code: "DE" },
  { label: "Florida", code: "FL" },
  { label: "Georgia", code: "GA" },
  { label: "Hawaii", code: "HI" },
  { label: "Idaho", code: "ID" },
  { label: "Illinois", code: "IL" },
  { label: "Indiana", code: "IN" },
  { label: "Iowa", code: "IA" },
  { label: "Kansas", code: "KS" },
  { label: "Kentucky", code: "KY" },
  { label: "Louisiana", code: "LA" },
  { label: "Maine", code: "ME" },
  { label: "Maryland", code: "MD" },
  { label: "Massachusetts", code: "MA" },
  { label: "Michigan", code: "MI" },
  { label: "Minnesota", code: "MN" },
  { label: "Mississippi", code: "MS" },
  { label: "Missouri", code: "MO" },
  { label: "Montana", code: "MT" },
  { label: "Nebraska", code: "NE" },
  { label: "Nevada", code: "NV" },
  { label: "New Hampshire", code: "NH" },
  { label: "New Jersey", code: "NJ" },
  { label: "New Mexico", code: "NM" },
  { label: "New York", code: "NY" },
  { label: "North Carolina", code: "NC" },
  { label: "North Dakota", code: "ND" },
  { label: "Ohio", code: "OH" },
  { label: "Oklahoma", code: "OK" },
  { label: "Oregon", code: "OR" },
  { label: "Pennsylvania", code: "PA" },
  { label: "Rhode Island", code: "RI" },
  { label: "South Carolina", code: "SC" },
  { label: "South Dakota", code: "SD" },
  { label: "Tennessee", code: "TN" },
  { label: "Texas", code: "TX" },
  { label: "Utah", code: "UT" },
  { label: "Vermont", code: "VT" },
  { label: "Virginia", code: "VA" },
  { label: "Washington", code: "WA" },
  { label: "West Virginia", code: "WV" },
  { label: "Wisconsin", code: "WI" },
  { label: "Wyoming", code: "WY" },
];

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  onSearch,
  initialFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedState, setSelectedState] = useState<{
    label: string;
    code: string;
  } | null>(null);

  useEffect(() => {
    // Check if any of the initial filters are set
    const isInitialSearch = Object.values(initialFilters).some((value) =>
      typeof value === "string" ? value.trim() !== "" : value
    );
    setHasSearched(isInitialSearch);

    // Check if initial location search is a state
    if (initialFilters.locationSearch) {
      const stateCode = extractStateFromLocation(initialFilters.locationSearch);
      if (stateCode) {
        const matchedState = stateOptions.find(
          (state) => state.code === stateCode
        );
        if (matchedState) {
          setSelectedState(matchedState);
        }
      }
    }
  }, [initialFilters]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (
    _event: React.SyntheticEvent,
    value: { label: string; code: string } | null
  ) => {
    setSelectedState(value);

    // Update location search field based on state selection
    if (value) {
      setFilters((prev) => ({
        ...prev,
        locationSearch: value.code, // Just use the state code for searching
      }));
    } else {
      setFilters((prev) => ({ ...prev, locationSearch: "" }));
    }
  };

  const handleLocationInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFilters((prev) => ({ ...prev, locationSearch: value }));

    // Clear selected state if user is typing something else
    if (selectedState && !value.includes(selectedState.code)) {
      setSelectedState(null);
    }
  };

  const handleSpecialistsOnlyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters((prev) => ({ ...prev, specialistsOnly: event.target.checked }));
  };

  const handleSearch = () => {
    onSearch(filters);
    setHasSearched(true);
    setIsExpanded(false);
  };

  const handleClearSearch = () => {
    const clearedFilters = {
      companySearch: "",
      locationSearch: "",
      specialistsOnly: false,
    };
    setFilters(clearedFilters);
    setSelectedState(null);
    onSearch(clearedFilters);
    setHasSearched(false);
  };

  return (
    <Box>
      <Box
        style={{
          display: "flex",
          marginBottom: "5px",
        }}>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          startIcon={<SearchIcon />}
          variant="outlined">
          {isExpanded ? "Hide Search" : "Search/Filter"}
        </Button>
        {hasSearched && (
          <Button
            onClick={handleClearSearch}
            startIcon={<ClearIcon />}
            variant="outlined"
            color="secondary">
            Clear Search
          </Button>
        )}
      </Box>
      <Collapse in={isExpanded}>
        <Box
          style={{
            padding: "10px",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            display: "inline-block",
          }}>
          <Box style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              label="Company"
              name="companySearch"
              value={filters.companySearch}
              onChange={handleInputChange}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                minWidth: "220px",
              }}>
              <Autocomplete
                id="state-select"
                options={stateOptions}
                value={selectedState}
                onChange={handleStateChange}
                getOptionLabel={(option) => `${option.label} (${option.code})`}
                renderInput={(params) => (
                  <TextField {...params} label="State" variant="outlined" />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.code === value.code
                }
              />
              <TextField
                label="City or Location"
                name="locationSearch"
                value={filters.locationSearch}
                onChange={handleLocationInputChange}
                placeholder="City, ST or state code"
              />
            </div>
          </Box>
          <Box
            style={{
              display: "flex",
              alignItems: "center",
            }}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.specialistsOnly}
                  onChange={handleSpecialistsOnlyChange}
                  name="specialistsOnly"
                />
              }
              label="Specialists Only"
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              className="table-search-btn">
              Search
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};
