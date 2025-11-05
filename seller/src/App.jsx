import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import Body from "./components/Body";
import { Signup } from "./pages/Signup";

function App() {
  return (
    <Provider store={appStore}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route path={"/"} element={<Body />}>
              <Route path={"/login"} element={<Login />} />
              <Route path={"/signup"} element={<Signup />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
