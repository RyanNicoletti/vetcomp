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
import { SortParams } from "./types";
import { Salary } from "../../../../shared-types/types";
import "./SalaryTable.css";
import { TableFooter } from "@mui/material";
import { useState } from "react";
import Pagination from "../pagination/Pagination";
import { moneyFormatter } from "../../utils/moneyFormatter";

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
          {salaryData?.salaries?.length &&
            salaryData?.salaries.map((row: Salary) => {
              return (
                <TableRow className="table-rows" key={row.salary_id}>
                  <TableCell
                    id={String(row.salary_id)}
                    scope="row"
                    padding="normal"
                    component="th">
                    <div>
                      <p>{row.company}</p>
                      <span>
                        {row.location} |{" "}
                        {new Date(row.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell align="left">
                    <div>
                      <p>{row.title}</p>
                      <span>{row.type_of_practice}</span>
                    </div>
                  </TableCell>
                  <TableCell align="left">{row.years_of_experience}</TableCell>
                  <TableCell align="right">
                    <div>
                      <p>
                        {row.total_compensation
                          ? moneyFormatter.format(row.total_compensation)
                          : moneyFormatter.format(row.hourly_rate!) + "/hr"}
                      </p>
                      <span>
                        {row.base_salary
                          ? moneyFormatter.format(row.base_salary)
                          : "n/a"}{" "}
                        |{" "}
                        {row.average_annual_production
                          ? moneyFormatter.format(row.average_annual_production)
                          : "n/a"}
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
              totalPages={salaryData.pages}
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
