import { Link } from "react-router-dom";
import { routePaths } from "../app/router/routePaths";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-container-low p-6 text-center">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-8 shadow-xl border border-outline-variant/30">
        <h1 className="font-display-xl text-primary text-6xl mb-4 font-extrabold">
          404
        </h1>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
          Page Not Found
        </h2>
        <p className="font-body-md text-body-md text-secondary mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to={routePaths.HOME}
          className="inline-flex px-6 py-3 bg-primary text-on-primary rounded-full font-semibold active:scale-95 transition-all shadow-md hover:bg-primary-container"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
