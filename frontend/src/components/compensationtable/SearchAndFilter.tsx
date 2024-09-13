import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Popover,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Switch,
  Box,
  Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

const practiceTypes = [
  "Small animal",
  "Large animal",
  "Equine",
  "Mixed animal",
  "Dairy",
  "Exotics",
  "Research: industry",
  "Research: government",
  "Other",
];

interface FilterState {
  companySearch: string;
  locationSearch: string;
  practiceTypeFilter: string[];
  specialistsOnly: boolean;
}

interface SearchAndFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

export const SearchAndFilter = ({ onFilterChange }: SearchAndFilterProps) => {
  const [filters, setFilters] = useState<FilterState>({
    companySearch: "",
    locationSearch: "",
    practiceTypeFilter: [],
    specialistsOnly: false,
  });
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handlePracticeTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.name;
    setFilters((prev) => ({
      ...prev,
      practiceTypeFilter: prev.practiceTypeFilter.includes(value)
        ? prev.practiceTypeFilter.filter((item) => item !== value)
        : [...prev.practiceTypeFilter, value],
    }));
  };

  const handleSpecialistsOnlyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters((prev) => ({ ...prev, specialistsOnly: event.target.checked }));
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "practice-type-popover" : undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="Search Company"
          name="companySearch"
          variant="outlined"
          value={filters.companySearch}
          onChange={handleInputChange}
        />
        <TextField
          label="Search Location"
          name="locationSearch"
          variant="outlined"
          value={filters.locationSearch}
          onChange={handleInputChange}
        />
        <Button
          aria-describedby={id}
          onClick={handleFilterClick}
          variant="outlined"
          startIcon={<FilterListIcon />}>
          Filter
        </Button>
      </Box>
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
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Practice Types
          </Typography>
          <FormGroup>
            {practiceTypes.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={filters.practiceTypeFilter.includes(type)}
                    onChange={handlePracticeTypeChange}
                    name={type}
                  />
                }
                label={type}
              />
            ))}
          </FormGroup>
        </Box>
      </Popover>
    </Box>
  );
};
