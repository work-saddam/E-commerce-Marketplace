import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "@/utils/constant";
import { addUser, removeUser, setLoading } from "@/store/userSlice";

const Body = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.user);
  const userId = user?._id;

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) return;
      dispatch(setLoading(true));
      try {
        const res = await axios.get(`${BASE_URL}/api/seller/profile`, {
          withCredentials: true,
        });
        if (res?.data?.data) {
          dispatch(addUser(res.data.data));
        }
      } catch (error) {
        // console.log("Failed to fetch user: ", error);
        dispatch(removeUser());
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUser();
  }, [userId, dispatch]);

  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
};

export default Body;
