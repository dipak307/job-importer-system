// components/ImportForm.jsx
import { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Paper, Typography, Stack } from '@mui/material';

export default function ImportForm({ onImported }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const startImport = async () => {
    if (!url) return alert('Please enter a feed URL');
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_IMPORT}/start`, { feedUrl: url });
      alert('Import started (logId: ' + res.data.logId + ')');
      setUrl('');
      onImported && onImported();
    } catch (err) {
      console.error(err);
      alert('Import error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" mb={2}>Start Import</Typography>

      <Stack spacing={2}>
        <TextField
          label="Feed URL (RSS/XML)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/jobs.rss"
          fullWidth
        />
        <Button variant="contained" onClick={startImport} disabled={loading}>
          {loading ? 'Starting...' : 'Start Import'}
        </Button>
      </Stack>
    </Paper>
  );
}
