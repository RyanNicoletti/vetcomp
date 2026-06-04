import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container, Typography } from "@mui/material";
import { getCompensationById } from "../queries/compensationQueries";
import { CompForm } from "../components/compform/CompForm";

const EditCompForm = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: compensation,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["compensation", id],
    queryFn: () => getCompensationById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6">Loading compensation data...</Typography>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          {(error as Error)?.message || "Unable to load compensation data."}
        </Typography>
      </Container>
    );
  }

  if (!compensation) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Compensation not found.
        </Typography>
      </Container>
    );
  }

  return <CompForm existingCompensation={compensation} />;
};

export default EditCompForm;
