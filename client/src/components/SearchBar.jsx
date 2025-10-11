import { useNavigate } from "react-router-dom";
import searchIcon from "../assets/search-icon.png";
import { useState } from "react";

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() === "") return;
    navigate(`/search?q=${query}`);
  };

  return (
    <div className="flex-1">
      <form
        onSubmit={handleSearch}
        className="flex items-center w-full bg-blue-100 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition-all"
      >
        <input
          type="text"
          placeholder="Search for product"
          className="flex-1 px-4 py-2 bg-transparent outline-none text-gray-700 text-sm sm:text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="px-5 py-2 rounded-full cursor-pointer">
          <img src={searchIcon} alt="serach-icon" className="w-6" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
