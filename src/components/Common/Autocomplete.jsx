/**
 * Autocomplete Component
 *
 * A reusable searchable dropdown input component.
 *
 * Features:
 * - Searches through provided data dynamically
 * - Supports multiple searchable fields
 * - Supports wildcard (*) searching
 * - Displays custom suggestion UI using renderSuggestion
 * - Select first suggestion with Enter key
 * - Navigate suggestions using Arrow Up and Arrow Down keys
 * - Press Tab to autocomplete the first suggestion
 * - Press Enter to select the highlighted suggestion
 * - Fully controlled input value
 *
 *
 * ==========================
 * BASIC USAGE
 * ==========================
 *
 * const users = [
 *   {
 *     id: 1,
 *     username: "JOHN001",
 *     name: "John Smith"
 *   },
 *   {
 *     id: 2,
 *     username: "MARY001",
 *     name: "Mary Jones"
 *   }
 * ];
 *
 *
 * <Autocomplete
 *   label="Search User"
 *   value={searchValue}
 *   onChange={setSearchValue}
 *
 *   data={users}
 *
 *   searchFields={[
 *     "username",
 *     "name"
 *   ]}
 *
 *   onSelect={(user)=>{
 *      console.log("Selected:", user);
 *   }}
 *
 *   renderSuggestion={(user)=>(
 *      <>
 *        <strong>{user.username}</strong>
 *        <div>{user.name}</div>
 *      </>
 *   )}
 * />
 *
 *
 * ==========================
 * PROPS
 * ==========================
 *
 * @param {string} label
 * Label displayed by SapInput
 *
 * @param {string} value
 * Current input value (controlled)
 *
 * @param {Function} onChange
 * Called whenever user types.
 * Receives the input string.
 *
 * @param {string} placeholder
 * Input placeholder text
 *
 * @param {string} icon
 * Optional input icon
 *
 * @param {Array<Object>} data
 * Data source to search.
 *
 * Example:
 * [
 *   { id:1, name:"ABC" },
 *   { id:2, name:"XYZ" }
 * ]
 *
 * @param {Array<string>} searchFields
 * Object keys that should be searched.
 *
 * Example:
 * [
 *   "name",
 *   "code"
 * ]
 *
 * @param {Function} onSelect
 * Runs when user selects a suggestion.
 * Receives the selected object.
 *
 * @param {number} maxResults
 * Maximum number of suggestions displayed.
 * Default: 10
 *
 * @param {Function} renderSuggestion
 * Custom rendering function for each suggestion.
 *
 * @param {Function} getSuggestionValue
 * Returns the value inserted into the input when Tab is pressed.
 *
 * Example:
 *
 * getSuggestionValue={(item)=>item.expenseNumber}
 *
 *
 * Example:
 *
 * renderSuggestion={(item)=>(
 *    <div>{item.name}</div>
 * )}
 *
 */

import { useState } from "react";
import SapInput from "./SapInput";

const Autocomplete = ({
  label,
  value,
  onChange,
  placeholder,
  icon,
  data = [],
  searchFields = [],
  onSelect,
  maxResults = 10,
  renderSuggestion,
  getSuggestionValue = (item) => item.id,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleSearch = (input) => {
    onChange(input);

    if (!input.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const search = input.toLowerCase().trim();

    const regex = new RegExp(
      search.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*"),
      "i",
    );

    const results = data.filter((item) => {
      return searchFields.some((field) => {
        const fieldValue = item[field];

        if (!fieldValue) return false;

        const text = String(fieldValue).toLowerCase();

        return search.includes("*") ? regex.test(text) : text.includes(search);
      });
    });

    const limitedResults = results.slice(0, maxResults);

    setSuggestions(limitedResults);

    setShowSuggestions(limitedResults.length > 0);

    setActiveIndex(-1);
  };

  const selectItem = (item) => {
    onSelect(item);

    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (!suggestions.length) return;

    // Move selection down
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));

      return;
    }

    // Move selection up
    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));

      return;
    }

    // Complete input with selected suggestion or first suggestion
    if (event.key === "Tab") {
      if (!suggestions.length) return;

      event.preventDefault();

      const selected =
        activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];

      selectItem(selected);
    }

    // Select highlighted item
    if (event.key === "Enter") {
      event.preventDefault();

      const selected =
        activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];

      selectItem(selected);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <SapInput
        label={label}
        value={value}
        onChange={handleSearch}
        placeholder={placeholder}
        icon={icon}
        onKeyDown={handleKeyDown}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",

            /*
              This keeps the dropdown aligned
              with the input start.
            */
            left: 0,

            top: "100%",

            width: "100%",

            marginTop: "4px",

            background: "#fff",

            border: "1px solid #ddd",

            borderRadius: "8px",

            zIndex: 9999,

            maxHeight: "300px",

            overflowY: "auto",

            boxShadow: "0 8px 20px rgba(0,0,0,.15)",
          }}
        >
          {suggestions.map((item, index) => (
            <div
              key={item.id}
              onClick={() => selectItem(item)}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                background: activeIndex === index ? "#e8f1ff" : "#fff",
              }}
            >
              {renderSuggestion ? renderSuggestion(item) : JSON.stringify(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
