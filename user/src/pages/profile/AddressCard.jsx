import { MapPin, Pencil, Trash2, Loader2 } from "lucide-react";

export default function AddressCard({ address, onEdit, onDelete, deleting }) {
  return (
    <div className="group relative p-4 sm:p-5 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl hover:border-outline-variant/20 transition-all">
      {address.isDefault && (
        <span className="absolute top-3 right-3 text-[8px] font-bold uppercase tracking-wider bg-champagne/15 text-champagne-dark border border-champagne/20 px-2 py-0.5 rounded-full">
          Default
        </span>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-surface-container flex items-center justify-center rounded-lg shrink-0 mt-0.5">
          <MapPin className="w-3.5 h-3.5 text-on-surface-variant/50" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-charcoal">{address.name}</p>
          <p className="text-xs text-on-surface-variant/55 mt-0.5">
            {address.phone}
          </p>
        </div>
      </div>

      <p className="text-xs text-on-surface-variant/70 leading-relaxed pl-11">
        {address.street}, {address.city}, {address.state} — {address.pincode},{" "}
        {address.country}
      </p>

      <div className="flex items-center gap-2 mt-4 pl-11">
        <button
          onClick={() => onEdit(address)}
          className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-secondary hover:text-champagne border border-secondary/15 hover:border-champagne px-3 py-1.5 rounded-md hover:bg-champagne/5 transition-all cursor-pointer"
        >
          <Pencil className="w-2.5 h-2.5" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(address._id)}
          disabled={deleting}
          className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-500/70 hover:text-red-600 border border-red-500/10 hover:border-red-500/20 px-3 py-1.5 rounded-md hover:bg-red-50 transition-all cursor-pointer disabled:opacity-40"
        >
          {deleting ? (
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
          ) : (
            <Trash2 className="w-2.5 h-2.5" />
          )}
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
