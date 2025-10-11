import { Outlet } from "react-router-dom";
import Header from "./Header";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser, removeUser, setLoading } from "../store/userSlice";

const Body = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.user);

  const fetchUser = async () => {
    if (user?._id) return;
    dispatch(setLoading(true));
    try {
      const res = await axios.get(`${BASE_URL}/api/users/profile`, {
        withCredentials: true,
      });
      if (res?.data?.data) {
        dispatch(addUser(res.data.data));
      }
    } catch (error) {
      // console.log("Failed to fetch user: ", error);
      dispatch(removeUser());
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
