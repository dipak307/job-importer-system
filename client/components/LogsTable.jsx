// components/LogsTable.jsx
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, CircularProgress, Box, Typography
} from '@mui/material';

const fetcher = (url) => axios.get(url).then(r => r.data);

function formatDateTime(date) {
  return new Date(date)
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    })
    .replace(",", "");
}


export default function LogsTable({ reloadKey }) {
  const api = process.env.NEXT_PUBLIC_API_IMPORT;
  const { data, error, isValidating } = useSWR(`${api}/logs`, fetcher, { refreshInterval: 5000, revalidateOnFocus: true, dedupingInterval: 2000, revalidateIfStale: true, revalidateOnReconnect: true, refreshWhenHidden: false, fallbackData: [] , refreshWhenOffline: false, // keep defaults
    revalidateOnMount: true, revalidateIfStale: true, shouldRetryOnError: false, // sane defaults
  });

  if (error) return <Paper sx={{ p:2 }}>Failed to load logs: {String(error.message)}</Paper>;
  if (!data && isValidating) return <Box sx={{ p:3 }}><CircularProgress /></Box>;

  return (
    <Paper sx={{ p:2 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
        <Typography variant="h6">Import History</Typography>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Feed URL</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>New</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell>Failed</TableCell>
            <TableCell>ImportDateTime</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {(data || []).map((log) => (
            <TableRow key={log._id}>
              <TableCell sx={{ maxWidth: 320, overflow: 'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.feedUrl}</TableCell>
              <TableCell>{log.totalFetched ?? 0}</TableCell>
              <TableCell>{log.newJobs ?? 0}</TableCell>
              <TableCell>{log.updatedJobs ?? 0}</TableCell>
              <TableCell>{log.failedCount ?? 0}</TableCell>
              <TableCell>{formatDateTime(log.startedAt)}</TableCell>
              <TableCell>
                <Link href={`/admin/log/${log._id}`} passHref>
                  <Button variant="outlined" size="small">View</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(!data || data.length === 0) && (
        <Box sx={{ mt:2 }}>
          <Typography variant="body2">No import logs found.</Typography>
        </Box>
      )}
    </Paper>
  );
}
