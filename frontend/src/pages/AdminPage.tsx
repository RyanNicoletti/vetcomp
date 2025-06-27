import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import AdminCompTable from "../components/admin/AdminCompTable";
import AdminUsersTable from "../components/admin/AdminUsersTable";
import AdminJobsTable from "../components/admin/AdminJobsTable";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const AdminPage = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", marginTop: "80px" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="admin tabs">
          <Tab label="Compensation Review" />
          <Tab label="User Management" />
          <Tab label="Job Management" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <AdminCompTable />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <AdminUsersTable />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <AdminJobsTable />
      </TabPanel>
    </Box>
  );
};

export default AdminPage;
