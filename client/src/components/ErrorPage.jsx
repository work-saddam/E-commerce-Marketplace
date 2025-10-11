import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Oops!</h1>
      <p className="mb-2">Something went wrong or this page doesn’t exist.</p>
      <Link to={"/"}>
        <p className="text-blue-600 underline">Go back to Home</p>
      </Link>
    </div>
  );
};

export default ErrorPage;
