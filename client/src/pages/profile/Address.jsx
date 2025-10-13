import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import confirmDelete from "../../utils/cofirmDelete";

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    phone: "",
  });

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/address`, {
        withCredentials: true,
      });
      setAddresses(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        // update
        await axios.put(
          `${BASE_URL}/api/users/address/${editingAddress._id}`,
          formData,
          { withCredentials: true }
        );
        toast?.success?.("Address updated!");
      } else {
        // add
        await axios.post(`${BASE_URL}/api/users/address`, formData, {
          withCredentials: true,
        });
        toast?.success?.("Address added!");
      }
      setShowForm(false);
      setEditingAddress(null);
      setFormData({
        name: "",
        street: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        phone: "",
      });
      fetchAddresses();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };

  const handleDelete = (id) => {
    confirmDelete(id, fetchAddresses);
  };

  const handleEdit = (addr) => {
    setEditingAddress(addr);
    setFormData(addr);
    setShowForm(true);
  };

  return (
    <div className="m-4 sm:p-4">
      <h3 className="font-semibold text-2xl sm:text-3xl mb-6 text-gray-800">
        Your Addresses
      </h3>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          onClick={() => setShowForm(true)}
          className="border-2 border-dashed border-gray-300 p-6 rounded-xl flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
        >
          <p className="text-blue-600 font-medium text-lg">+ Add Address</p>
        </div>

        {addresses.map((add) => (
          <div
            key={add._id}
            className="border p-5 rounded-xl shadow-sm bg-white hover:shadow-md transition-all"
          >
            <p className="font-semibold text-lg text-gray-800">{add.name}</p>
            <p className="text-gray-600">{add.street}</p>
            <p className="text-gray-600">
              {add.city}, {add.state}
            </p>
            <p className="text-gray-600">
              {add.country} - {add.pincode}
            </p>
            <p className="text-gray-700 mt-1 text-sm"> {add.phone}</p>

            <div className="flex gap-5 mt-4">
              <button
                onClick={() => handleEdit(add)}
                className="text-blue-600 font-medium hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(add._id)}
                className="text-red-500 font-medium hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                "name",
                "street",
                "city",
                "state",
                "country",
                "pincode",
                "phone",
              ].map((field) => (
                <input
                  key={field}
                  type="text"
                  required
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                />
              ))}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAddress(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium"
                >
                  {editingAddress ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
