## Project Overview

This workspace contains a full-stack e-commerce marketplace application with separate frontend applications for the client and seller, and a shared backend.

### Project Structure

- `backend/`: Node.js/Express.js backend, MongoDB (Mongoose), BullMQ for background jobs, Razorpay integration.
- `client/`: React/Vite frontend for customers, Redux Toolkit for state management.
- `seller/`: React/Vite frontend for sellers, Redux Toolkit for state management, UI component library (potentially Shadcn UI).

### Key Technologies

**Backend:**
- Node.js, Express.js
- MongoDB (via Mongoose)
- BullMQ (for Mail and Inventory jobs)
- Cloudinary (image management)
- Razorpay (payment gateway)
- JWT (authentication)
- CORS configured for local and Vercel deployments (client and seller).

**Frontend (Client & Seller):**
- React, Vite
- Redux Toolkit, Redux Persist
- React Router DOM
- Tailwind CSS
- Axios (HTTP requests)

### Build and Run Commands

**Backend:**
- `npm install` (to install dependencies)
- `npm run dev` (starts the server with `nodemon` for development)
- `npm start` (starts the server with `node` for production)

**Frontend (Client & Seller):**
- `npm install` (to install dependencies)
- `npm run dev` (starts the development server)
- `npm run build` (builds the application for production)

### Environment Variables

- Both frontend and backend utilize environment variables (e.g., `VITE_BASE_URL` for frontends, `PORT`, `JWT_SECRET`, database connection strings for the backend). Ensure these are correctly configured in `.env` files or deployment platforms.

### Important Considerations for AI Agents

- **Authentication:** The backend uses JWTs for authentication, typically sent via HTTP-only cookies. Frontend applications send requests with `withCredentials: true`.
- **CORS:** The backend has specific origins configured for CORS. If deploying to new domains, ensure they are added to the `cors.origin` array in `backend/src/server.js`.
- **Testing:** No dedicated unit or integration test commands are currently configured in any `package.json`. If asked to add tests, this would be a new setup.
- **Background Jobs:** BullMQ is used for mail and inventory jobs; when working with these features, consider the job queue and worker architecture.
- **API Endpoints:** Backend API routes are prefixed with `/api/` (e.g., `/api/seller/orders`).
