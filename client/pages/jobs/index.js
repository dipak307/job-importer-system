import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, TextField, Button, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, Pagination, Stack, Typography
} from '@mui/material';
import Link from 'next/link';

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  async function fetchJobs(p = page, q = search) {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_JOBS}?page=${p}&limit=${limit}&search=${encodeURIComponent(q)}`
      );
      console.log(res.data,"datadata");
      setJobs(res.data.jobs);
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);

    } catch (err) {
      console.error(err);
      alert('Failed to fetch jobs');
    }
  }
console.log(jobs,"jobsjobs");
  useEffect(() => {
    fetchJobs(1, '');
  }, []);

  const doSearch = () => {
    setPage(1);
    fetchJobs(1, search);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" mb={2}>Jobs</Typography>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Search title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" onClick={doSearch}>Search</Button>
        </Stack>
      </Paper>

      {/* Job Table */}
      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Posted</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job._id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>
                  {job.postedAt
                    ? new Date(job.postedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </TableCell>
                <TableCell>
                  <Link href={`/jobs/${job._id}`}>
                    <Button variant="outlined">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, v) => {
              setPage(v);
              fetchJobs(v, search);
            }}
          />
        </Stack>
      </Paper>
    </Container>
  );
}
