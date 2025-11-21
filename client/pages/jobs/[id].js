// pages/jobs/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_JOBS}/${id}`);
      setJob(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load job');
    }
  };

  if (!job) return <Container sx={{ py:4 }}><Typography>Loading...</Typography></Container>;

  return (
    <Container sx={{ py:4 }}>
      <Link href="/jobs"><Button variant="outlined">Back to jobs</Button></Link>

      <Paper sx={{ p:3, mt:2 }}>
        <Typography variant="h5">{job.title}</Typography>
        <Typography variant="subtitle1">{job.company} — {job.location}</Typography>
        <Typography sx={{ mt:2 }}>{job.description}</Typography>
        {job.url && <Typography sx={{ mt:2 }}><a href={job.url} target="_blank" rel="noreferrer">View original</a></Typography>}
      </Paper>
    </Container>
  );
}
