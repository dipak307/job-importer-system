

///./redis-server.exe

<!-- git clone https://github.com/dipak307/job-importer-system.git -->
// cd server
// npm install     (it will install all dependency)
// create file name .env 
/// add this 
<!-- PORT=4000
MONGO_URI=mongodb://localhost:27017/jobimporter 
# Redis port can be 6380 if 6379 is blocked  
REDIS_URL=redis://localhost:6380
QUEUE_NAME=job-import-queue
BATCH_SIZE=25   
MAX_CONCURRENCY=5
RETRY_ATTEMPTS=5
RETRY_BACKOFF_MS=2000
REDIS_PUBSUB_CHANNEL=job-events 
NEXT_PUBLIC_API_IMPORT=http://localhost:4000/api/import
NEXT_PUBLIC_API_JOBS=http://localhost:4000/api/jobs
-->

// install redis if you don't have version should be 5 or greater than
// redis server star command 
<!-- redis-server -->    run in cmd or powershell
// dependency list for backend
// use command npm i or npm install 
<!-- axios,bullmq,cors,dotenv,express,ioredis,mongoose,node-cron,socket.io -->

// backend command for starting 
// npm run dev or npm start (depend on script)

// worker starting command
// npm run worker (depend on script)

// manual cron start command 
// npm run cron


// for frontend 
// cd client 
// npm install (it will install all dependency)

//dependency install manually if not get installed
// npm i or npm install axios,socket.io-client,swr
//for styling  npm install @mui/material @emotion/react @emotion/styled
// frontend starting command 
// npm run dev
<!-- for frontend view routing  -->
Access the frontend UI:
// admin panel 
// http://localhost:3000/admin

// jobs
// http://localhost:3000/jobs
   









