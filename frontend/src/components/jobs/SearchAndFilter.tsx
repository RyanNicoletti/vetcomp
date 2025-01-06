import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  FormControlLabel,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import "./SearchAndFilter.css";

interface SearchAndFilterProps {
  onSearch: (filters: FilterState) => void;
  initialFilters: FilterState;
}

interface FilterState {
  companySearch?: string;
  locationSearch?: string;
  practiceTypeFilter?: string[];
  typeFilter?: string[];
}

const practiceTypes = [
  "Small animal",
  "Large animal",
  "Mixed practice",
  "Emergency",
  "Specialty",
  "Shelter",
];

const jobTypes = ["full-time", "part-time", "contract", "relief"];

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  onSearch,
  initialFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const isInitialSearch = Object.values(initialFilters).some((value) =>
      Array.isArray(value)
        ? value.length > 0
        : typeof value === "string"
        ? value.trim() !== ""
        : value
    );
    setHasSearched(isInitialSearch);
  }, [initialFilters]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (
    field: "practiceTypeFilter" | "typeFilter",
    value: string[]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRemoveFilter = (
    field: "practiceTypeFilter" | "typeFilter",
    valueToRemove: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field]?.filter((value) => value !== valueToRemove) || [],
    }));
    onSearch({
      ...filters,
      [field]: filters[field]?.filter((value) => value !== valueToRemove) || [],
    });
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
      practiceTypeFilter: [],
      typeFilter: [],
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
    setHasSearched(false);
  };

  const renderActiveFilters = () => {
    const practiceTypeFilters = filters.practiceTypeFilter || [];
    const typeFilters = filters.typeFilter || [];

    if (practiceTypeFilters.length === 0 && typeFilters.length === 0) {
      return null;
    }

    return (
      <Box className="active-filters">
        {practiceTypeFilters.map((filter) => (
          <Chip
            key={`practice-${filter}`}
            label={filter}
            onDelete={() => handleRemoveFilter("practiceTypeFilter", filter)}
            size="small"
            className="active-filter-chip"
          />
        ))}
        {typeFilters.map((filter) => (
          <Chip
            key={`type-${filter}`}
            label={filter}
            onDelete={() => handleRemoveFilter("typeFilter", filter)}
            size="small"
            className="active-filter-chip"
          />
        ))}
      </Box>
    );
  };

  return (
    <Box className="search-filter-container">
      <Box className="search-buttons">
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

      {renderActiveFilters()}

      <Collapse in={isExpanded}>
        <Box className="search-filter-content">
          <Box className="search-inputs-container">
            <Box className="search-inputs">
              <TextField
                label="Company"
                name="companySearch"
                value={filters.companySearch}
                onChange={handleInputChange}
                className="search-input"
                size="small"
              />
              <TextField
                label="Location"
                name="locationSearch"
                value={filters.locationSearch}
                onChange={handleInputChange}
                className="search-input"
                size="small"
              />
            </Box>

            <Box className="filter-inputs">
              <FormControl className="filter-select" size="small">
                <InputLabel>Practice Type</InputLabel>
                <Select
                  multiple
                  value={filters.practiceTypeFilter}
                  onChange={(e) =>
                    handleFilterChange(
                      "practiceTypeFilter",
                      e.target.value as string[]
                    )
                  }
                  input={<OutlinedInput label="Practice Type" />}
                  renderValue={(selected) => (
                    <Box className="filter-chips">
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}>
                  {practiceTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl className="filter-select" size="small">
                <InputLabel>Job Type</InputLabel>
                <Select
                  multiple
                  value={filters.typeFilter}
                  onChange={(e) =>
                    handleFilterChange("typeFilter", e.target.value as string[])
                  }
                  input={<OutlinedInput label="Job Type" />}
                  renderValue={(selected) => (
                    <Box className="filter-chips">
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}>
                  {jobTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleSearch}
                className="search-button">
                Search
              </Button>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};
