import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Collapse,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

interface SearchAndFilterProps {
  onSearch: (filters: FilterState) => void;
  initialFilters: FilterState;
}

interface FilterState {
  companySearch: string;
  locationSearch: string;
  specialistsOnly: boolean;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  onSearch,
  initialFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Check if any of the initial filters are set
    const isInitialSearch = Object.values(initialFilters).some((value) =>
      typeof value === "string" ? value.trim() !== "" : value
    );
    setHasSearched(isInitialSearch);
  }, [initialFilters]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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
    onSearch(clearedFilters);
    setHasSearched(false);
  };

  return (
    <Box style={{ marginBottom: "10px" }}>
      <Box
        style={{
          display: "flex",
          marginBottom: "5px",
        }}>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          startIcon={<SearchIcon />}
          variant="outlined">
          {isExpanded ? "Hide Search" : "Show Search"}
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
          <Typography variant="h6" gutterBottom>
            Search/Filter
          </Typography>
          <Box style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              label="Company"
              name="companySearch"
              value={filters.companySearch}
              onChange={handleInputChange}
            />
            <TextField
              label="Location"
              name="locationSearch"
              value={filters.locationSearch}
              onChange={handleInputChange}
            />
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
