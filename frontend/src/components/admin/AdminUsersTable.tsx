import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Box,
  Chip,
  Button,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EmailIcon from "@mui/icons-material/Email";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getUsersWithCompensations } from "../../queries/adminQueries";
import { moneyFormatter } from "../../utils/moneyFormatter";
import ErrorBlock from "../ErrorBlock";

interface UserWithCompensations {
  id: string;
  email: string;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  compensations: any[];
}

const AdminUsersTable = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: getUsersWithCompensations,
  });

  const toggleRow = (userId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  const handleEmailUser = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  if (isLoading) {
    return <div style={{ marginBottom: "300px" }}>Loading users...</div>;
  }

  if (isError) {
    return (
      <ErrorBlock
        title="Error: "
        message={error?.message || "Failed to load users"}
      />
    );
  }

  if (!users || users.length === 0) {
    return (
      <Typography
        variant="h6"
        style={{ textAlign: "center", marginTop: "2rem" }}>
        No users found.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} style={{ marginTop: "2rem" }}>
      <Table>
        <TableHead style={{ backgroundColor: "#919191" }}>
          <TableRow>
            <TableCell style={{ color: "white", fontWeight: "600" }}>
              Expand
            </TableCell>
            <TableCell style={{ color: "white", fontWeight: "600" }}>
              Email
            </TableCell>
            <TableCell style={{ color: "white", fontWeight: "600" }}>
              Account Status
            </TableCell>
            <TableCell style={{ color: "white", fontWeight: "600" }}>
              Compensations Count
            </TableCell>
            <TableCell style={{ color: "white", fontWeight: "600" }}>
              Joined Date
            </TableCell>
            <TableCell style={{ color: "white", fontWeight: "600" }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user: UserWithCompensations, index) => (
            <>
              <TableRow
                key={user.id}
                style={{
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#ebebeb",
                }}>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => toggleRow(user.id)}
                    disabled={user.compensations.length === 0}>
                    {expandedRows.has(user.id) ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </IconButton>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    {user.is_verified ? (
                      <Chip label="Verified" color="success" size="small" />
                    ) : (
                      <Chip label="Unverified" color="default" size="small" />
                    )}
                    {user.is_admin && (
                      <Chip label="Admin" color="primary" size="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{user.compensations.length}</TableCell>
                <TableCell>
                  {format(new Date(user.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Button
                    startIcon={<EmailIcon />}
                    onClick={() => handleEmailUser(user.email)}
                    variant="outlined"
                    size="small">
                    Email
                  </Button>
                </TableCell>
              </TableRow>

              {expandedRows.has(user.id) && user.compensations.length > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    style={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse
                      in={expandedRows.has(user.id)}
                      timeout="auto"
                      unmountOnExit>
                      <Box margin={2}>
                        <Typography variant="h6" gutterBottom component="div">
                          Compensation Data
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Company</TableCell>
                              <TableCell>Title</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Experience</TableCell>
                              <TableCell>Total Compensation</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Date Added</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {user.compensations.map((comp) => (
                              <TableRow key={comp.id}>
                                <TableCell>{comp.company}</TableCell>
                                <TableCell>{comp.title}</TableCell>
                                <TableCell>{comp.location}</TableCell>
                                <TableCell>
                                  {comp.years_of_experience} years
                                </TableCell>
                                <TableCell>
                                  {comp.total_compensation
                                    ? moneyFormatter.format(
                                        comp.total_compensation
                                      )
                                    : comp.hourly_rate
                                    ? `${moneyFormatter.format(
                                        comp.hourly_rate
                                      )}/hr`
                                    : "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" gap={0.5}>
                                    {comp.is_approved && (
                                      <Chip
                                        label="Approved"
                                        color="success"
                                        size="small"
                                      />
                                    )}
                                    {comp.is_verified && (
                                      <Chip
                                        label="Verified"
                                        color="primary"
                                        size="small"
                                      />
                                    )}
                                    {comp.needs_review && (
                                      <Chip
                                        label="Needs Review"
                                        color="warning"
                                        size="small"
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  {format(
                                    new Date(comp.created_at),
                                    "MMM d, yyyy"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AdminUsersTable;
