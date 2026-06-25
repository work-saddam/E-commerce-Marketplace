import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function UserLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-container-low">
      <Header />
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
