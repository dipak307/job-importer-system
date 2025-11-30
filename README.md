
->> Local Setup (Frontend + Backend + Worker)
 - git clone https://github.com/dipak307/job-importer-system.git 
 - cd job-importer-system


 ->>Backend Setup (server)
 - cd server
 - npm install

->> Create .env 
    MONGO_URI=mongodb://localhost:27017/jobimporter
    REDIS_URL=redis://localhost:6379
    PORT=5000

->> Start MongoDB & Redis using Docker 
 - docker run -d -p 27017:27017 --name mongo mongo
 - docker run -d -p 6379:6379 --name redis redis

--> start backend
- npm start
- node workers/jobWorker.js or npm run worker


-->> Frontend Setup (client)
- cd client
- npm install
- .env local or you can add in root .env
   NEXT_PUBLIC_API_IMPORT=http://localhost:5000/api/import
   NEXT_PUBLIC_API_JOBS=http://localhost:5000/api/jobs

-> Start Frontend Next.js

- npm run dev
- http://localhost:3000
- http://localhost:3000/admin
- http://localhost:3000/jobs

--> hosted Link on Render 
 - https://job-importer-system-4.onrender.com/admin
 - https://job-importer-system-4.onrender.com/jobs




