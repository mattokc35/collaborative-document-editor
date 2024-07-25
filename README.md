# React + TypeScript + Vite

I used React, TypeScript, Vite, WebSockets, MaterialUI, ReactQuill, Node.js, Express, and JWT for this project.


## Setup

First, let's set up the backend.

From the project root directory, cd to /backend:

```
cd backend
```

Then, run: 

```
npm install
```

To set up the self-contained SQLite database, run:

```
npm run init-db
```

You will need a secret key to handle user authentication in the backend. Generate one using:

```
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Next, in the /backend folder, create a `.env` file and put the secret key inside it:

```
ACCESS_TOKEN_SECRET=your_generated_secret_key
```

Now, start up the backend server by running:

```
npm start
```

Next, let's set up the frontend.

Change back to the project root directory:

```
cd ..
```

Then run:

```
npm install
```

and finally:

```
npm run dev
```

