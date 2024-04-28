import Alert from "@mui/material/Alert";

interface ErrorBlockProps {
  title: string;
  message: string;
}

export default function ErrorBlock({ title, message }: ErrorBlockProps) {
  return (
    <div className="error-block">
      <div className="error-bock-text">
        <Alert severity="error">
          {title}: {message}
        </Alert>
      </div>
    </div>
  );
}
