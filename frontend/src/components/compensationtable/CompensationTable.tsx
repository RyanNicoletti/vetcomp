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
import "./CompensationTable.css";
import { Button, TableFooter, Typography } from "@mui/material";
import { useState } from "react";
import Pagination from "../pagination/Pagination";
import { NavLink } from "react-router-dom";
import { ExpandableRow } from "./ExpandableRow";

export default function SalaryTable() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortParams, setSortParams] = useState<SortParams>({
    sortDirection: "asc",
    sortBy: "",
  });

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

  const {
    data: compensationData,
    isError: salaryIsError,
    error: salaryError,
    isPending: salaryIsPending,
  } = useQuery({
    queryKey: ["salaries", page, rowsPerPage, sortParams],
    queryFn: () => getAllSalaries(page, rowsPerPage, sortParams),
    placeholderData: keepPreviousData,
  });

  if (salaryIsError) {
    return <ErrorBlock title="Error: " message={salaryError.message} />;
  }

  if (salaryIsPending) {
    return <div style={{ marginBottom: "300px" }}>Loading...</div>;
  }

  return (
    <>
      <TableContainer className="table-container">
        <NavLink to="/addcomp" className="btn-link">
          <Button className="add-comp-btn" color="primary" variant="contained">
            Add Compensation
          </Button>
        </NavLink>
        <Table className="salary-table" aria-labelledby="tableTitle">
          <TableHead className="table-header">
            <TableRow className="table-row">
              <TableCell className="expand-cell" />
              <TableCell
                key="company-location"
                align={"left"}
                className="company-location-cell">
                <div>
                  <p>Company</p>
                  <span>Location | Date</span>
                </div>
              </TableCell>
              <TableCell
                key="type-of-practice"
                align={"left"}
                className="type-of-practice-cell">
                <div>
                  <p>Job Title</p>
                  <span className="practice-type-span">Practice Type</span>
                </div>
              </TableCell>
              <TableCell
                key="years-of-experience"
                align={"center"}
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
                align={"right"}
                className="total-compensation-cell">
                <TableSortLabel
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
      </TableContainer>
    </>
  );
}
