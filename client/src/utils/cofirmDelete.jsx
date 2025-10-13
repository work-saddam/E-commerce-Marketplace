import toast from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "./constants";

const confirmDelete = (id, fetchAddresses) => {
  toast.custom((t) => (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col gap-3 border border-gray-200">
      <p className="text-gray-800 font-medium">
        Are you sure you want to delete this address?
      </p>
      <div className="flex justify-end gap-2">
        <button
          className="px-3 py-1 rounded-lg text-sm bg-gray-200 hover:bg-gray-300 cursor-pointer"
          onClick={() => toast.dismiss(t.id)}
        >
          Cancel
        </button>
        <button
          className="px-3 py-1 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 cursor-pointer"
          onClick={async () => {
            try {
              await axios.delete(`${BASE_URL}/api/users/address/${id}`, {
                withCredentials: true,
              });
              toast.dismiss(t.id);
              toast.success("Address removed!");
              fetchAddresses();
            } catch (error) {
              toast.dismiss(t.id);
              toast.error("Failed to delete address.");
              console.error(error);
            }
          }}
        >
          Delete
        </button>
      </div>
    </div>
  ));
};

export default confirmDelete;
