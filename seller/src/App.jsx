import { Button } from "./components/ui/button";

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <p className="text-3xl font-bold text-black">
        Setup: React + Tailwind + shadcn
      </p>
      <Button className={"m-4"} variant={"default"}>
        Button
      </Button>
    </div>
  );
}

export default App;
