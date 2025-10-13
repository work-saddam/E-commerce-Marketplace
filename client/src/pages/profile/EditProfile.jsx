import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../../utils/constants";
import { addUser } from "../../store/userSlice";

const EditProfile = () => {
  const { user } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await axios.put(
        `${BASE_URL}/api/users/profile`,
        { name },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      setSuccess("Profile updated successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md">
        <h4 className="font-bold text-2xl mb-4">Profile</h4>

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-4 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-600">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              placeholder="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              disabled
              type="email"
              placeholder="Email"
              value={email}
              // onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              disabled
              type="text"
              placeholder="Phone Number"
              value={phone}
              // onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full bg-green-400 px-4 py-2 rounded-lg font-medium text-white cursor-pointer hover:bg-green-500"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
