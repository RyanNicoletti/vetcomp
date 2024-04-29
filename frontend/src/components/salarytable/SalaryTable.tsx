import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableSortLabel from "@mui/material/TableSortLabel";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useQuery } from "@tanstack/react-query";
import { getAllSalaries } from "../../queries/salaryQueries";
import ErrorBlock from "../ErrorBlock";
import { Salary } from "./types";
import "./SalaryTable.css";
import { Box } from "@mui/material";

export default function SalaryTable() {
  const {
    data: salaryData,
    isError: salaryIsError,
    error: salaryError,
    isPending: salaryIsPending,
  } = useQuery({
    queryKey: ["salaries"],
    queryFn: getAllSalaries,
  });

  if (salaryIsError) {
    return <ErrorBlock title="Error: " message={salaryError.message} />;
  }

  if (salaryIsPending) {
    return <div style={{ marginBottom: "300px" }}>Loading...</div>;
  }

  return (
    <TableContainer>
      <Table
        sx={{
          width: "50%",
          mt: "100px",
          mb: "100px",
          mr: "auto",
          ml: "auto",
        }}
        aria-labelledby="tableTitle">
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
            <TableCell key="years-of-experience" align={"right"}>
              <TableSortLabel>Years of Experience</TableSortLabel>
            </TableCell>
            <TableCell key="total-compensation" align={"right"}>
              <TableSortLabel>
                <div>
                  <p>Total Compensation (USD)</p>
                  <span>Base | Production (yr)</span>
                </div>
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {salaryData &&
            salaryData.map((row: Salary, index: string | undefined) => {
              return (
                <TableRow className="table-rows">
                  <TableCell
                    id={index}
                    scope="row"
                    padding="none"
                    component="th">
                    <div>
                      <p>{row.company}</p>
                      <span>
                        {row.location} | {row.created_at}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <div>
                      <p>{row.title}</p>
                      <span>{row.type_of_practice}</span>
                    </div>
                  </TableCell>
                  <TableCell align="right">{row.years_of_experience}</TableCell>
                  <TableCell align="right">
                    <div>
                      <p>{row.total_compensation}</p>
                      <span>
                        {row.base_salary} | {row.average_annual_production}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
