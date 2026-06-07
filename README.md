# AlgoMentor

AlgoMentor is a Next.js-based web application designed as a comprehensive platform for algorithmic learning, mentorship, and competitive programming. 

## Features
- **User Authentication:** Secure login and registration utilizing JWT, password hashing via bcrypt, and Google OAuth integration.
- **Personalized Dashboard:** A central hub for users to track their progress and activities.
- **Problems & Contests:** A built-in platform to access algorithmic coding problems and participate in structured contests.
- **Performance Analysis:** Tools and metrics for users to analyze their coding performance.
- **Mentorship System:** Dedicated features to connect users with mentors for guidance, feedback, and support.
- **Profile & Settings:** Customizable user profiles and comprehensive account settings.

## Tech Stack
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Frontend:** React, CSS Modules, Lucide React (Icons)
- **Backend & API:** Next.js API Routes
- **Database:** MongoDB with [Mongoose](https://mongoosejs.com/)
- **Authentication:** JWT, Google Auth Library, bcryptjs
- **Email Services:** Nodemailer
- **HTTP Client:** Axios

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory and add the necessary environment variables (e.g., MongoDB URI, JWT Secret, Google OAuth credentials).

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure
- `/src/app`: Contains the Next.js App Router pages including routes for `/dashboard`, `/login`, `/problems`, `/contests`, `/mentor`, `/analysis`, and more.
- `/src/app/api`: Backend API routes.
- `/src/components`: Reusable UI components like `DashboardLayout` and `GoogleLoginButton`.
- `/src/models`: Mongoose database schemas and models.
- `/src/context`: React Context providers for global state management.
- `/src/services` & `/src/utils`: Helper functions and external service integrations.
- `/src/lib`: Core library configurations.
