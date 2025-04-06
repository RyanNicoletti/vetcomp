import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableSortLabel from "@mui/material/TableSortLabel";
import TableRow from "@mui/material/TableRow";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAllSalaries } from "../../queries/compensationQueries";
import ErrorBlock from "../ErrorBlock";
import { SortParams } from "./types";
import { ICompensation } from "../../../../shared-types/types";
import {
  Button,
  TableFooter,
  Typography,
  IconButton,
  Popover,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Box,
} from "@mui/material";
import Pagination from "../pagination/Pagination";
import { NavLink } from "react-router-dom";
import { ExpandableRow } from "./ExpandableRow";
import { SearchAndFilter } from "./SearchAndFilter";
import FilterListIcon from "@mui/icons-material/FilterList";
import "./CompensationTable.css";
import TableBlocker from "./TableBlocker";

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

export default function SalaryTable() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortParams, setSortParams] = useState<SortParams>({
    sortDirection: "asc",
    sortBy: "",
  });
  const [filters, setFilters] = useState<FilterState>({
    companySearch: "",
    locationSearch: "",
    practiceTypeFilter: [],
    specialistsOnly: false,
  });
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [showBlocker, setShowBlocker] = useState(true);

  useEffect(() => {
    const hasContributed = localStorage.getItem("hasContributedSalary");
    if (hasContributed === "true") {
      setShowBlocker(false);
    }
  }, []);

  const handleDismissBlocker = () => {
    setShowBlocker(false);
    localStorage.setItem("hasContributedSalary", "true");
  };

  const handleSortRequest = (column: string): void => {
    const newSortDirection =
      sortParams.sortDirection === "asc" ? "desc" : "asc";
    setSortParams({ sortDirection: newSortDirection, sortBy: column });
  };

  const handleChangePage = (newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number): void => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleSearch = (
    searchFilters: Omit<FilterState, "practiceTypeFilter">
  ) => {
    setFilters((prev) => ({ ...prev, ...searchFilters }));
    setPage(1);
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
    setPage(1);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const {
    data: compensationData,
    isError: salaryIsError,
    error: salaryError,
    isPending: salaryIsPending,
  } = useQuery({
    queryKey: ["salaries", page, rowsPerPage, sortParams, filters],
    queryFn: () => getAllSalaries(page, rowsPerPage, sortParams, filters),
    placeholderData: keepPreviousData,
  });

  if (salaryIsError) {
    return <ErrorBlock title="Error: " message={salaryError.message} />;
  }

  if (salaryIsPending) {
    return <div style={{ marginBottom: "300px" }}>Loading...</div>;
  }

  const open = Boolean(anchorEl);
  const id = open ? "practice-type-popover" : undefined;

  return (
    <>
      <TableContainer className="table-container">
        <Box className="table-actions">
          <NavLink to="/addcomp" className="btn-link">
            <Button
              id="add-compensation"
              className="add-comp-btn"
              color="primary"
              variant="contained">
              Add Compensation
            </Button>
          </NavLink>
          <SearchAndFilter
            onSearch={handleSearch}
            initialFilters={{
              companySearch: filters.companySearch,
              locationSearch: filters.locationSearch,
              specialistsOnly: filters.specialistsOnly,
            }}
          />
        </Box>
        <div style={{ position: "relative" }}>
          <Table className="salary-table" aria-labelledby="tableTitle">
            <TableHead className="table-header">
              <TableRow className="table-row">
                <TableCell className="expand-cell" />
                <TableCell
                  key="company-location"
                  align="left"
                  className="company-location-cell">
                  <div>
                    <p>Company</p>
                    <span>Location | Date</span>
                  </div>
                </TableCell>
                <TableCell
                  key="type-of-practice"
                  align="left"
                  className="type-of-practice-cell">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>
                      <p>Job Title</p>
                      <span className="practice-type-span">Practice Type</span>
                    </div>
                    <IconButton
                      aria-describedby={id}
                      onClick={handleFilterClick}
                      size="small">
                      <FilterListIcon />
                    </IconButton>
                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleFilterClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}>
                      <FormGroup sx={{ p: 2 }}>
                        {practiceTypes.map((type) => (
                          <FormControlLabel
                            key={type}
                            control={
                              <Checkbox
                                checked={filters.practiceTypeFilter.includes(
                                  type
                                )}
                                onChange={handlePracticeTypeChange}
                                name={type}
                              />
                            }
                            label={type}
                          />
                        ))}
                      </FormGroup>
                    </Popover>
                  </div>
                </TableCell>
                <TableCell
                  key="years-of-experience"
                  align="center"
                  className="years-of-experience-cell">
                  <TableSortLabel
                    direction={sortParams.sortDirection}
                    onClick={() => handleSortRequest("years_of_experience")}>
                    <div>
                      <Typography className="years-of-experience-label">
                        Years of Experience
                      </Typography>
                      <span className="empty-span"></span>
                    </div>
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  key="total-compensation"
                  align="right"
                  className="total-compensation-cell">
                  <TableSortLabel
                    className="total-comp-th"
                    direction={sortParams.sortDirection}
                    onClick={() => handleSortRequest("total_compensation")}>
                    <div>
                      <p>Total Compensation (USD)</p>
                      <span>Base salary | Production</span>
                    </div>
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="tbody">
              {compensationData?.compensations?.map((row: ICompensation) => (
                <ExpandableRow key={row.id} row={row} />
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <Pagination
                  page={page}
                  totalPages={compensationData.pages}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
          {showBlocker && <TableBlocker onClose={handleDismissBlocker} />}
        </div>
      </TableContainer>
    </>
  );
}
