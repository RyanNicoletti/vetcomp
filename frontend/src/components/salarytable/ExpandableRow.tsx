import React, { useState } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Grid,
  Typography,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { CompensationDetail } from "../../../../shared-types/types";
import {
  formatNullableMoneyValue,
  moneyFormatter,
} from "../../utils/moneyFormatter";
import "./ExpandableRow.css";

interface ExpandableRowProps {
  row: CompensationDetail;
}

export const ExpandableRow: React.FC<ExpandableRowProps> = ({ row }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
              {row.base_salary ? moneyFormatter.format(row.base_salary) : "n/a"}{" "}
              |{" "}
              {row.average_annual_production
                ? moneyFormatter.format(row.average_annual_production)
                : "n/a"}
            </span>
          </div>
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
