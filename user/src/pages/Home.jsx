import { useAuth } from "../features/auth";
import Button from "../shared/components/ui/Button";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-container-low p-6">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-8 shadow-xl border border-outline-variant/30 text-center">
        <h1 className="font-headline-lg text-headline-md text-on-surface mb-2">
          Welcome to Trustkart
        </h1>
        <p className="font-body-md text-body-md text-secondary mb-6">
          You have successfully logged in to your premium account.
        </p>

        {user ? (
          <div className="mb-6 rounded-2xl bg-surface-container p-4 text-left space-y-2">
            <p className="text-sm font-label-bold text-on-surface">
              Name:{" "}
              <span className="font-normal text-secondary">{user.name}</span>
            </p>
            <p className="text-sm font-label-bold text-on-surface">
              Email:{" "}
              <span className="font-normal text-secondary">{user.email}</span>
            </p>
            <p className="text-sm font-label-bold text-on-surface">
              Phone:{" "}
              <span className="font-normal text-secondary">{user.phone}</span>
            </p>
            <p className="text-sm font-label-bold text-on-surface">
              Role:{" "}
              <span className="font-normal text-secondary uppercase text-xs px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed">
                {user.role}
              </span>
            </p>
          </div>
        ) : null}

        <Button
          onClick={logout}
          variant="secondary"
          className="w-full py-3 cursor-pointer"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
