import { useState } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Grid,
  Typography,
  Tooltip,
  Button,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { ICompensation } from "../../../../shared-types/types";
import {
  formatNullableMoneyValue,
  moneyFormatter,
} from "../../utils/moneyFormatter";
import "./AdminExpandableRow.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveCompensationById,
  deleteCompensationById,
  verifyCompensationById,
} from "../../queries/adminQueries";
import { useSnackbar } from "../../context/SnackbarContext";

export const AdminExpandableRow = ({ row }: { row: ICompensation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { openSnackbar } = useSnackbar();

  const queryClient = useQueryClient();

  const approveCompMutation = useMutation({
    mutationFn: approveCompensationById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCompensations"] });
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      openSnackbar("Approved compensation successfully", "success");
    },
    onError: (error) => handleError(error, "approving"),
  });

  const verifyCompMutation = useMutation({
    mutationFn: verifyCompensationById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCompensations"] });
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      openSnackbar("Verified compensation successfully", "success");
    },
    onError: (error) => handleError(error, "verifying"),
  });

  const deleteCompMutation = useMutation({
    mutationFn: deleteCompensationById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCompensations"] });
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      openSnackbar("Deleted compensation successfully", "success");
    },
    onError: (error) => handleError(error, "deleting"),
  });

  const handleError = (error: any, action: string) => {
    console.error(`Error ${action} compensation:`, error);
    openSnackbar(
      error.message || `An error occurred while ${action} the compensation`,
      "error"
    );
  };

  const handleApproveComp = (id: string) => {
    approveCompMutation.mutate(id);
  };
  const handleVerifyComp = (id: string) => {
    verifyCompMutation.mutate(id);
  };
  const handleDeleteComp = (id: string) => {
    deleteCompMutation.mutate(id);
  };

  return (
    <>
      <TableRow className="table-rows">
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <div>
            <p>{row.company}</p>
            <span>
              {row.location} |{" "}
              {new Date(row.created_at as Date).toLocaleDateString("en-US", {
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
              {row.base_salary ? moneyFormatter.format(row.base_salary) : "n/a"}{" "}
              |{" "}
              {row.average_annual_production
                ? moneyFormatter.format(row.average_annual_production)
                : "n/a"}
            </span>
          </div>
        </TableCell>
        <TableCell>
          {row.verification_document_url ? (
            <a
              href={row.verification_document_url}
              target="_blank"
              rel="noopener noreferrer">
              {row.verification_document_name}
            </a>
          ) : (
            ""
          )}
        </TableCell>
        <TableCell>
          <Button onClick={() => handleApproveComp(row.id)}>Approve</Button>
          <Button onClick={() => handleVerifyComp(row.id)}>Verify</Button>
          <Button onClick={() => handleDeleteComp(row.id)}>Delete</Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box className="expandedDetailsOuterContainer">
                <Grid container>
                  <Grid item xs={2.5}>
                    <Typography variant="h6">Compensation Details:</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography>
                      Sign on bonus:{" "}
                      {formatNullableMoneyValue(row.sign_on_bonus) ?? "--"}
                    </Typography>
                    <Typography>
                      Percent production:
                      <Tooltip title="Percent of total production that goes towards salary">
                        <IconButton
                          size="small"
                          style={{
                            padding: 0,
                            marginLeft: "0px",
                            marginRight: "2px",
                            marginBottom: "10px",
                          }}>
                          <InfoOutlinedIcon style={{ fontSize: "0.8rem" }} />
                        </IconButton>
                      </Tooltip>
                      {row.percent_production ?? "--"}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography>
                      Days/week: {row.days_worked_per_week ?? "--"}
                    </Typography>
                    <Typography>
                      Number Veterinarians in practice:{" "}
                      {row.number_of_veterinarians ?? "--"}
                    </Typography>
                    <Typography>Gender: {row.gender ?? "--"}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
