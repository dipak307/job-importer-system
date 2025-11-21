// pages/admin/log/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';

export default function LogDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchLog();
  }, [id]);

  const fetchLog = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_IMPORT}/logs/${id}`);
      setLog(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load log: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!log) return <Container sx={{ py:4 }}><Typography>Loading...</Typography></Container>;

  return (
    <Container sx={{ py:4 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
        <Typography variant="h5">Import Log Details</Typography>
        <Link href="/admin" passHref><Button variant="outlined">Back to logs</Button></Link>
      </Box>

      <Paper sx={{ p:3, mb:3 }}>
        <Typography><strong>Feed URL:</strong> {log.feedUrl}</Typography>
        <Typography><strong>Total fetched:</strong> {log.totalFetched}</Typography>
        <Typography><strong>New jobs:</strong> {log.newJobs}</Typography>
        <Typography><strong>Updated jobs:</strong> {log.updatedJobs}</Typography>
        <Typography><strong>Failed:</strong> {log.failedCount}</Typography>
        <Typography><strong>Started:</strong> {new Date(log.startedAt).toLocaleString()}</Typography>
        <Typography><strong>Finished:</strong> {log.finishedAt ? new Date(log.finishedAt).toLocaleString() : 'In progress'}</Typography>
      </Paper>

      <Typography variant="h6">Failed jobs ({log.failedCount})</Typography>

      {log.failedJobs && log.failedJobs.length > 0 ? (
        log.failedJobs.map((f, i) => (
          <Paper key={i} sx={{ p:2, mb:2 }}>
            <Typography><strong>Reason:</strong> {f.reason}</Typography>
            <details style={{ marginTop: 8 }}>
              <summary>Show raw item</summary>
              <pre style={{ whiteSpace:'pre-wrap' }}>{JSON.stringify(f.item, null, 2)}</pre>
            </details>
          </Paper>
        ))
      ) : (
        <Typography>No failed jobs for this import.</Typography>
      )}

    </Container>
  );
}
