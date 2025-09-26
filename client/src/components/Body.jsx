import { Outlet } from "react-router-dom";
import Header from "./Header";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../store/userSlice";

const Body = () => {
  const dispatch = useDispatch();
  const userData = useSelector((store) => store.user);

  const fetchUser = async () => {
    if (userData?._id) return;

    try {
      const res = await axios.get(`${BASE_URL}/api/users/profile`, {
        withCredentials: true,
      });
      if (res?.data?.data) {
        dispatch(addUser(res.data.data));
      }
    } catch (error) {
      // console.log("Failed to fetch user: ", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
};

export default Body;
