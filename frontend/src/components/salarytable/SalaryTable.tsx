import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableSortLabel from "@mui/material/TableSortLabel";
import TableRow from "@mui/material/TableRow";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAllSalaries } from "../../queries/salaryQueries";
import ErrorBlock from "../ErrorBlock";
import { Salary, SortParams } from "./types";
import "./SalaryTable.css";
import { TableFooter } from "@mui/material";
import { useMemo, useState } from "react";
import Pagination from "./Pagination";

export default function SalaryTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortParams, setSortParams] = useState<SortParams>({
    sortDirection: "asc",
    sortBy: "",
  });

  const handleSortRequest = (column: string) => {
    const newSortDirection =
      sortParams.sortDirection === "asc" ? "desc" : "asc";
    setSortParams({ sortDirection: newSortDirection, sortBy: column });
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const {
    data: salaryData,
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
    <TableContainer className="table-container">
      <Table className="salary-table" aria-labelledby="tableTitle">
        <TableHead className="table-header">
          <TableRow>
            <TableCell key="company-location" align={"left"}>
              <div>
                <p>Company</p>
                <span>Location | Date</span>
              </div>
            </TableCell>
            <TableCell key="type-of-practice" align={"left"}>
              <div>
                <p>Job Title</p>
                <span>Practice Type</span>
              </div>
            </TableCell>
            <TableCell
              key="years-of-experience"
              align={"left"}
              className="years-of-experience-header">
              <TableSortLabel
                direction={sortParams.sortDirection}
                onClick={() => handleSortRequest("years_of_experience")}>
                <div>
                  <p>Years of Experience</p>
                  <span className="empty-span"></span>
                </div>
              </TableSortLabel>
            </TableCell>
            <TableCell key="total-compensation" align={"right"}>
              <TableSortLabel
                direction={sortParams.sortDirection}
                onClick={() => handleSortRequest("total_compensation")}>
                <div>
                  <p>Total Compensation (USD)</p>
                  <span>Base | Production (yr)</span>
                </div>
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {salaryData?.salaryData.salaries?.length &&
            salaryData.salaryData.salaries.map((row: Salary) => {
              return (
                <TableRow className="table-rows">
                  <TableCell
                    id={String(row.salaryId)}
                    scope="row"
                    padding="normal"
                    component="th">
                    <div>
                      <p>{row.company}</p>
                      <span>
                        {row.location} | {row.createdAt}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell align="left">
                    <div>
                      <p>{row.title}</p>
                      <span>{row.typeOfPractice}</span>
                    </div>
                  </TableCell>
                  <TableCell align="left">{row.yearsOfExperience}</TableCell>
                  <TableCell align="right">
                    <div>
                      <p>{row.total_compensation?.toLocaleString()}</p>
                      <span>
                        {row.baseSalary?.toLocaleString()} |
                        {row.averageAnnualProduction?.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <Pagination
              page={page}
              totalPages={salaryData.salaryData.pages}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
