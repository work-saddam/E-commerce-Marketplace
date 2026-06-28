import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
}) {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex logic for ellipsis if totalPages is large
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  const formatNumber = (num) => {
    if (typeof num !== "number") return num;
    return num < 10 ? `0${num}` : num.toString();
  };

  return (
    <div className="mt-24 flex items-center justify-center gap-8 border-t border-outline-variant/20 pt-12 select-none">
      {/* Prev Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`font-label-caps text-xs flex items-center gap-2 tracking-wider transition-colors ${
          currentPage === 1
            ? "text-on-surface-variant/30 cursor-not-allowed"
            : "text-on-surface-variant hover:text-champagne cursor-pointer"
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>PREV</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-6">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="font-label-caps text-xs text-on-surface-variant/40">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`font-label-caps text-xs transition-colors cursor-pointer select-none pb-0.5 ${
                isActive
                  ? "text-champagne font-bold border-b-2 border-champagne"
                  : "text-on-surface-variant hover:text-champagne"
              }`}
            >
              {formatNumber(page)}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`font-label-caps text-xs flex items-center gap-2 tracking-wider transition-colors ${
          currentPage === totalPages
            ? "text-on-surface-variant/30 cursor-not-allowed"
            : "text-on-surface-variant hover:text-champagne cursor-pointer"
        }`}
      >
        <span>NEXT</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
