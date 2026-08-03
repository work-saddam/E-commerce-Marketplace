import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { MapPin, Plus, AlertTriangle, X, Loader2 } from "lucide-react";
import apiClient from "../../shared/services/apiClient";
import Loader from "../../shared/components/feedback/Loader";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";

export default function ManageAddressesTab() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/users/address");
      setAddresses(res?.data?.data || []);
    } catch {
      toast.error("Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAdd = async (data) => {
    setSubmitting(true);
    try {
      const res = await apiClient.post("/api/users/address", data);
      toast.success("Address added successfully!");
      setAddresses((prev) => [res.data.data, ...prev]);
      setShowForm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add address.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data) => {
    setSubmitting(true);
    try {
      const res = await apiClient.put(
        `/api/users/address/${editingAddress._id}`,
        data,
      );
      toast.success("Address updated successfully!");
      setAddresses((prev) =>
        prev.map((a) => (a._id === editingAddress._id ? res.data.data : a)),
      );
      setEditingAddress(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update address.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = (id) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      await apiClient.delete(`/api/users/address/${id}`);
      toast.success("Address deleted.");
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch {
      toast.error("Failed to delete address.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (address) => {
    setEditingAddress(address);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-charcoal">Saved Addresses</h3>
          <p className="text-[10px] text-on-surface-variant/50 font-semibold uppercase tracking-wider mt-0.5">
            {addresses.length} address{addresses.length === 1 ? "" : "es"} on
            file
          </p>
        </div>
        {!showForm && !editingAddress && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 bg-charcoal text-surface-container-lowest font-label-caps text-[10px] px-4 py-2 rounded-lg hover:bg-champagne hover:text-charcoal transition-all cursor-pointer font-bold uppercase shadow-sm"
          >
            <Plus className="w-3 h-3" />
            <span>Add New</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <AddressForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          submitting={submitting}
        />
      )}

      {editingAddress && (
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleEdit}
          onCancel={() => setEditingAddress(null)}
          submitting={submitting}
        />
      )}

      {/* Address Cards */}
      {addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center bg-surface-container/20 border border-outline-variant/8 rounded-2xl">
          <div className="w-14 h-14 bg-champagne/10 rounded-full flex items-center justify-center text-champagne border border-champagne/15">
            <MapPin className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-charcoal">
              No Addresses Saved
            </p>
            <p className="text-xs text-on-surface-variant/55 max-w-xs">
              Add a delivery address to streamline your checkout experience.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 bg-charcoal text-surface-container-lowest font-label-caps text-[10px] px-5 py-2.5 rounded-lg hover:bg-champagne hover:text-charcoal transition-all cursor-pointer font-bold uppercase shadow-sm"
          >
            <Plus className="w-3 h-3" />
            <span>Add Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr._id}
              address={addr}
              onEdit={handleStartEdit}
              onDelete={handleDeleteRequest}
              deleting={deletingId === addr._id}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" />

          {/* Dialog */}
          <div
            className="relative w-full max-w-sm bg-surface-container-lowest border border-outline-variant/15 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="absolute top-4 right-4 text-on-surface-variant/30 hover:text-charcoal transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>

            {/* Message */}
            <div className="text-center space-y-1.5">
              <h3 className="text-sm font-bold text-charcoal">
                Delete Address?
              </h3>
              <p className="text-xs text-on-surface-variant/60 leading-relaxed max-w-65 mx-auto">
                This action cannot be undone. The address will be permanently removed from your account.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 hover:text-charcoal border border-outline-variant/15 px-4 py-2.5 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-600 text-white font-label-caps text-[10px] px-4 py-2.5 rounded-xl hover:bg-red-700 transition-all cursor-pointer font-bold uppercase shadow-sm"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
