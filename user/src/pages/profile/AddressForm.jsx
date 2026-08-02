import { useState } from "react";
import toast from "react-hot-toast";
import { Save, X, Loader2 } from "lucide-react";
import { EMPTY_ADDRESS } from "./profileConstants";

export default function AddressForm({ initialData, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initialData || EMPTY_ADDRESS);
  const isEdit = Boolean(initialData?._id);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, phone, street, city, state, pincode, country } = form;
    if (
      !name.trim() ||
      !phone.trim() ||
      !street.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim() ||
      !country.trim()
    ) {
      toast.error("Please fill all address fields.");
      return;
    }
    onSubmit(form);
  };

  const fields = [
    { key: "name", label: "Full Name", type: "text", placeholder: "John Doe", colSpan: 1 },
    { key: "phone", label: "Phone Number", type: "tel", placeholder: "+91 9876543210", colSpan: 1 },
    { key: "street", label: "Street Address", type: "text", placeholder: "123, Main Street, Apt 4B", colSpan: 2 },
    { key: "city", label: "City", type: "text", placeholder: "Mumbai", colSpan: 1 },
    { key: "state", label: "State", type: "text", placeholder: "Maharashtra", colSpan: 1 },
    { key: "pincode", label: "Pin Code", type: "text", placeholder: "400001", colSpan: 1 },
    { key: "country", label: "Country", type: "text", placeholder: "India", colSpan: 1 },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 sm:p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl space-y-5"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
          {isEdit ? "Edit Address" : "Add New Address"}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-on-surface-variant/40 hover:text-charcoal transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div
            key={field.key}
            className={field.colSpan === 2 ? "sm:col-span-2" : ""}
          >
            <label
              htmlFor={`address-${field.key}`}
              className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest block mb-1.5"
            >
              {field.label}
            </label>
            <input
              id={`address-${field.key}`}
              type={field.type}
              value={form[field.key]}
              onChange={handleChange(field.key)}
              placeholder={field.placeholder}
              className="w-full px-3.5 py-2.5 border border-outline-variant/15 rounded-xl bg-surface-container-lowest text-charcoal text-sm font-medium focus:outline-none focus:ring-2 focus:ring-champagne/30 focus:border-champagne transition-all placeholder:text-on-surface-variant/25"
              disabled={submitting}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 bg-charcoal text-surface-container-lowest font-label-caps text-[10px] px-6 py-2.5 rounded-xl hover:bg-champagne hover:text-charcoal transition-all cursor-pointer font-bold uppercase disabled:opacity-50 shadow-sm"
        >
          {submitting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Save className="w-3 h-3" />
          )}
          <span>{submitting ? "Saving..." : isEdit ? "Update Address" : "Save Address"}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 hover:text-charcoal border border-outline-variant/15 px-5 py-2.5 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
