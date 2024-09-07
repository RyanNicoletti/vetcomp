import { useState } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { ICompensation } from "../../../../shared-types/types";
import {
  formatMoneyAbbreviated,
  formatNullableMoneyValue,
  moneyFormatter,
} from "../../utils/moneyFormatter";
import "./ExpandableRow.css";

interface ExpandableRowProps {
  row: ICompensation;
}

export const ExpandableRow = ({ row }: ExpandableRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow className="table-rows">
        <TableCell className="expand-cell">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell className="company-location-cell">
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
        <TableCell align="left" className="type-of-practice-cell">
          <div>
            <p>{row.title}</p>
            <span>{row.type_of_practice}</span>
          </div>
        </TableCell>
        <TableCell align="center" className="years-of-experience-cell">
          {row.years_of_experience}
        </TableCell>
        <TableCell align="right" className="total-compensation-cell">
          <div>
            <p className="total-comp-p">
              {row.total_compensation
                ? moneyFormatter.format(row.total_compensation)
                : moneyFormatter.format(row.hourly_rate!) + "/hr"}
            </p>
            <span className="total-comp-span">
              {row.base_salary
                ? formatMoneyAbbreviated(row.base_salary)
                : "n/a"}{" "}
              |{" "}
              {row.average_annual_production
                ? formatMoneyAbbreviated(row.average_annual_production)
                : "n/a"}
            </span>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box className="expanded-details-container">
                <div className="expanded-row-title">
                  Additional Comp Details:
                </div>
                <Box className="grid-container">
                  <div className="yoe">
                    Years of Experience: {row.years_of_experience}
                  </div>
                  <div className="sign-on">
                    Sign on bonus:{" "}
                    {formatNullableMoneyValue(row.sign_on_bonus) ?? "--"}
                  </div>
                  <div className="percent-production">
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
                  </div>
                  <div className="days-per-week">
                    Days/week: {row.days_worked_per_week ?? "--"}
                  </div>
                  <div className="number-vets">
                    Number Veterinarians in practice:{" "}
                    {row.number_of_veterinarians ?? "--"}
                  </div>
                  <div className="gender">Gender: {row.gender ?? "--"}</div>
                </Box>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
