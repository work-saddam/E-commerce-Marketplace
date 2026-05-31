import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import Body from "./components/Body";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Provider } from "react-redux";
import { appStore, persistor } from "./store/appStore";
import { PersistGate } from "redux-persist/integration/react";
import Orders from "./pages/Orders";
import ProtectedLayout from "./layout/ProtectedLayout";
import OrderDetails from "./pages/OrderDetails";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Provider store={appStore}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Toaster position="top-center" reverseOrder={false} />

          <Routes>
            <Route path={"/"} element={<Body />}>
              <Route path={"/login"} element={<Login />} />
              <Route path={"/signup"} element={<Signup />} />
              <Route path={"/forgot-password"} element={<ForgotPassword />} />

              <Route element={<ProtectedLayout />}>
                <Route path={"/orders"} element={<Orders />} />
                <Route path={"/order/:id"} element={<OrderDetails />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
