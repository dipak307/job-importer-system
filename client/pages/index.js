import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <div className="header">
        <h1>Job Importer — Admin</h1>
      </div>

      <p>Open the admin panel to start imports and view logs.</p>

      <ul>
        <li><Link href="/admin">Admin Panel (Import + Logs)</Link></li>
        <li><Link href="/jobs">Jobs List</Link></li>
      </ul>

      <hr/>
      <p>Reference PDF (assignment): <code>/mnt/data/Full Stack Developer (MERN) Task -Artha Job Board (2).pdf</code></p>
    </div>
  );
}
