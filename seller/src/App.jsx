import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import Body from "./components/Body";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/"} element={<Body />}>
          <Route path={"/login"} element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
