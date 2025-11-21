import { useState, useEffect } from "react";
import { Container } from "@mui/material";
import { io } from "socket.io-client";
import ImportForm from "../../components/ImportForm";
import LogsTable from "../../components/LogsTable";
import { useToast } from "../../components/ToastProvider";

export default function AdminIndex() {
  const { showToast } = useToast();
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = () => setReloadKey((k) => k + 1);
  

  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      showToast("Connected to live server updates", "success");
    });

    socket.on("job-processed", (data) => {
      showToast(`Processed: ${data.itemTitle}`, "info");
      refresh();
    });

    socket.on("job-failed", (data) => {
      showToast(`Failed: ${data.reason}`, "error");
      refresh();
    });

    socket.on("import-finished", (data) => {
      showToast("🎉 Import Finished Successfully!", "success");
      refresh();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <h1>Admin – Job Importer</h1>

      <ImportForm onImported={refresh} />

      <LogsTable reloadKey={reloadKey} />
    </Container>
  );
}
