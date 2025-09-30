import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import { Provider } from "react-redux";
import appStore from "./store/appStore";
import Register from "./components/Register";
import Profile from "./pages/Profile/profile";
import EditProfile from "./pages/profile/editProfile";
import ProtectedLayout from "./layout/ProtectedLayout";
import Addresses from "./pages/profile/Address";
import Main from "./components/Main";
import ProductDetails from "./components/ProductDetails";
import ErrorPage from "./components/ErrorPage";

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Body />}>
            <Route path="/" element={<Main />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedLayout />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/editProfile" element={<EditProfile />} />
              <Route path="/addresses" element={<Addresses />} />
            </Route>

            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
