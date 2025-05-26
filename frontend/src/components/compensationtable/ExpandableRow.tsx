import { useState } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Tooltip,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import PaidIcon from "@mui/icons-material/Paid";
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

  const formattedDate = new Date(row.created_at as Date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

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
            {row.is_specialist ? (
              <span>Specialization: {row.specialization}</span>
            ) : (
              <span>{row.type_of_practice}</span>
            )}
          </div>
        </TableCell>
        <TableCell align="center" className="years-of-experience-cell">
          {row.years_of_experience}
        </TableCell>
        <TableCell align="right" className="total-compensation-cell">
          <div className="comp-row-container">
            <div className="comp-data">
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
            <div className="verification-checkmark">
              {row.is_verified && (
                <Tooltip title="Verified Compensation" arrow placement="top">
                  <CheckCircleIcon color="success" fontSize="small" />
                </Tooltip>
              )}
            </div>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box className="expanded-details-container">
                <div className="expanded-details-grid">
                  <div className="expanded-details-column">
                    <Box className="expanded-section">
                      <Typography
                        variant="subtitle1"
                        className="expanded-section-title">
                        <WorkIcon fontSize="small" className="expanded-icon" />
                        Position Details
                      </Typography>
                      <Divider className="expanded-divider" />

                      <div className="expanded-detail-item">
                        <div className="expanded-label">Title:</div>
                        <div className="expanded-value">{row.title}</div>
                      </div>

                      <div className="expanded-detail-item">
                        <div className="expanded-label">
                          {row.is_specialist
                            ? "Specialization:"
                            : "Practice Type:"}
                        </div>
                        <div className="expanded-value">
                          {row.is_specialist
                            ? row.specialization
                            : row.type_of_practice}
                        </div>
                      </div>

                      <div className="expanded-detail-item">
                        <div className="expanded-label">
                          Years of Experience:
                        </div>
                        <div className="expanded-value">
                          {row.years_of_experience}
                        </div>
                      </div>

                      <div className="expanded-detail-item">
                        <div className="expanded-label">New Graduate:</div>
                        <div className="expanded-value">
                          {row.is_new_grad ? "Yes" : "No"}
                        </div>
                      </div>

                      {row.is_practice_owner && (
                        <div className="expanded-detail-item">
                          <div className="expanded-label">Practice Owner:</div>
                          <div className="expanded-value">Yes</div>
                        </div>
                      )}

                      {row.practice_description && (
                        <div className="expanded-detail-item">
                          <div className="expanded-label">
                            Practice Details:
                          </div>
                          <div className="expanded-value">
                            {row.practice_description}
                          </div>
                        </div>
                      )}

                      {row.is_traveling && (
                        <div className="expanded-detail-item">
                          <div className="expanded-label">Work Type:</div>
                          <div className="expanded-value">
                            Traveling (multiple locations)
                          </div>
                        </div>
                      )}

                      {row.gender && (
                        <div className="expanded-detail-item">
                          <div className="expanded-label">Gender:</div>
                          <div className="expanded-value">{row.gender}</div>
                        </div>
                      )}
                    </Box>

                    <Box className="expanded-section">
                      <Typography
                        variant="subtitle1"
                        className="expanded-section-title">
                        <BusinessIcon
                          fontSize="small"
                          className="expanded-icon"
                        />
                        Practice Information
                      </Typography>
                      <Divider className="expanded-divider" />

                      <div className="expanded-detail-item">
                        <div className="expanded-label">Company:</div>
                        <div className="expanded-value">{row.company}</div>
                      </div>

                      <div className="expanded-detail-item">
                        <div className="expanded-label">Location:</div>
                        <div className="expanded-value">{row.location}</div>
                      </div>

                      {row.number_of_veterinarians && (
                        <div className="expanded-detail-item">
                          <div className="expanded-label">
                            Number of Veterinarians:
                          </div>
                          <div className="expanded-value">
                            {row.number_of_veterinarians}
                          </div>
                        </div>
                      )}

                      {row.days_worked_per_week && (
                        <div className="expanded-detail-item">
                          <div className="expanded-label">
                            Days Worked Per Week:
                          </div>
                          <div className="expanded-value">
                            {row.days_worked_per_week}
                          </div>
                        </div>
                      )}

                      <div className="expanded-detail-item">
                        <div className="expanded-label">Date Added:</div>
                        <div className="expanded-value">{formattedDate}</div>
                      </div>
                    </Box>
                  </div>

                  <div className="expanded-details-column">
                    <Box className="expanded-section">
                      <Typography
                        variant="subtitle1"
                        className="expanded-section-title">
                        <PaidIcon fontSize="small" className="expanded-icon" />
                        Compensation Details
                      </Typography>
                      <Divider className="expanded-divider" />

                      <div className="expanded-detail-item">
                        <div className="expanded-label">Payment Type:</div>
                        <div className="expanded-value">
                          {row.payment_frequency === "annually"
                            ? "Annual Salary"
                            : "Hourly Rate"}
                        </div>
                      </div>

                      {row.payment_frequency === "annually" ? (
                        <>
                          <div className="expanded-detail-item">
                            <div className="expanded-label">Base Salary:</div>
                            <div className="expanded-value">
                              {moneyFormatter.format(row.base_salary!)}
                            </div>
                          </div>
                          <div className="expanded-detail-item">
                            <div className="expanded-label">
                              Total Compensation:
                            </div>
                            <div className="expanded-value">
                              {moneyFormatter.format(row.total_compensation!)}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="expanded-detail-item">
                          <div className="expanded-label">Hourly Rate:</div>
                          <div className="expanded-value">
                            {moneyFormatter.format(row.hourly_rate!)}
                          </div>
                        </div>
                      )}

                      {row.average_annual_production && (
                        <div className="expanded-detail-item">
                          <div className="expanded-label">
                            Avg. Annual Production:
                          </div>
                          <div className="expanded-value">
                            {formatNullableMoneyValue(
                              row.average_annual_production
                            )}
                          </div>
                        </div>
                      )}

                      {row.sign_on_bonus && (
                        <div className="expanded-detail-item">
                          <div className="expanded-label">Sign-on Bonus:</div>
                          <div className="expanded-value">
                            {formatNullableMoneyValue(row.sign_on_bonus)}
                          </div>
                        </div>
                      )}

                      {row.percent_production && (
                        <div className="expanded-detail-item">
                          <div className="expanded-label">
                            Production Percentage:
                            <Tooltip title="Percent of total production that goes towards salary">
                              <IconButton
                                size="small"
                                className="info-icon-button">
                                <InfoOutlinedIcon className="info-icon" />
                              </IconButton>
                            </Tooltip>
                          </div>
                          <div className="expanded-value">
                            {row.percent_production}%
                          </div>
                        </div>
                      )}

                      <div className="expanded-detail-item">
                        <div className="expanded-label">
                          Verification Status:
                        </div>
                        <div className="expanded-value">
                          {row.is_verified ? (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Verified"
                              color="success"
                              size="small"
                            />
                          ) : row.needs_review ? (
                            <Chip
                              label="Pending Review"
                              color="warning"
                              size="small"
                            />
                          ) : (
                            <Chip
                              label="Unverified"
                              color="default"
                              size="small"
                            />
                          )}
                        </div>
                      </div>
                    </Box>
                  </div>
                </div>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
