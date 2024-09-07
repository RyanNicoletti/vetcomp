import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableSortLabel from "@mui/material/TableSortLabel";
import TableRow from "@mui/material/TableRow";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ErrorBlock from "../ErrorBlock";
import { SortParams } from "../compensationtable/types";
import { ICompensation } from "../../../../shared-types/types";
import "./AdminCompTable.css";
import { Button, TableFooter } from "@mui/material";
import { useState } from "react";
import Pagination from "../pagination/Pagination";
import { NavLink } from "react-router-dom";
import { AdminExpandableRow } from "./AdminExpandableRow";
import { getCompensationsAdmin } from "../../queries/adminQueries";

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
    queryKey: ["adminCompensations", page, rowsPerPage, sortParams],
    queryFn: () => getCompensationsAdmin(page, rowsPerPage, sortParams),
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
      <TableContainer className="table-container-admin">
        <NavLink to="/addcomp" className="btn-link-admin">
          <Button
            className="add-comp-btn-admin"
            color="primary"
            variant="contained">
            Add Compensation
          </Button>
        </NavLink>
        <Table className="salary-table-admin" aria-labelledby="tableTitle">
          <TableHead className="table-header-admin">
            <TableRow>
              <TableCell className="expand-cell-admin" />
              <TableCell
                key="company-location"
                className="company-location-cell-admin"
                align={"left"}>
                <div>
                  <p>Company</p>
                  <span>Location | Date</span>
                </div>
              </TableCell>
              <TableCell
                key="type-of-practice"
                className="type-of-practice-cell-admin"
                align={"left"}>
                <div>
                  <p>Job Title</p>
                  <span>Practice Type</span>
                </div>
              </TableCell>
              <TableCell
                key="years-of-experience"
                align={"left"}
                className="years-of-experience-cell-admin">
                <TableSortLabel
                  direction={sortParams.sortDirection}
                  onClick={() => handleSortRequest("years_of_experience")}>
                  <div>
                    <p>Years of Experience</p>
                    <span className="empty-span-admin"></span>
                  </div>
                </TableSortLabel>
              </TableCell>
              <TableCell
                key="total-compensation"
                className="total-compensation-cell-admin"
                align={"right"}>
                <TableSortLabel
                  direction={sortParams.sortDirection}
                  onClick={() => handleSortRequest("total_compensation")}>
                  <div>
                    <p>Total Compensation (USD)</p>
                    <span>Base salary | Production/year</span>
                  </div>
                </TableSortLabel>
              </TableCell>
              <TableCell
                key="verification-document"
                className="verification-document-cell-admin">
                <div>
                  <p>Verification</p>
                  <span className="empty-span-admin"></span>
                </div>
              </TableCell>
              <TableCell
                key="admin-actions"
                className="admin-actions-cell-admin">
                <div>
                  <p>Admin Actions</p>
                  <span className="empty-span-admin"></span>
                </div>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {compensationData?.compensations?.map((row: ICompensation) => (
              <AdminExpandableRow key={row.id} row={row} />
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
