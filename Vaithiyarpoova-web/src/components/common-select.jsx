import Select, { components } from "react-select";
import PropTypes from "prop-types";
import { matchSorter } from "match-sorter"; 
import { forwardRef, useState } from "react";

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M4 8L12 16L20 8H4Z" fill="#404040" />
      </svg>
    </components.DropdownIndicator>
  );
};

const CommonSelect = forwardRef(({
  name,
  options,
  value,
  onChange,
  placeholder = "Select designation",
  isSearchable = false,
  disabled = false
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: "100%",
    }),
    control: (provided, state) => ({
      ...provided,
      borderRadius: "6px",
      border: state.isDisabled ? "1px solid #02401748" : "none",        
      backgroundColor: state.isDisabled ? "#F7FAF8" : provided.backgroundColor, 
      padding: "0px 2px",
      minHeight: "42px",
      maxHeight: "42px",
      boxShadow: "none",
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'default'
    }),
    option: (provided, state) => {
      let backgroundColor;
      if (state.isFocused) {
        backgroundColor = "rgb(240 245 242)";
      } else if (state.isSelected) {
        backgroundColor = "#e6f4ec";
      } else {
        backgroundColor = "white";
      }
  
      const backgroundImage = state.isSelected
        ? "linear-gradient(3deg, #0B622F, #18934b)"
        : "none";
  
      let color;
      if (state.isFocused) {
        color = "#121212";
      } else if (state.isSelected) {
        color = "#fff";
      } else {
        color = "#121212";
      }
  
      return {
        ...provided,
        backgroundColor,
        backgroundImage,
        color,
        cursor: "pointer",
        padding: "10px 12px",
      };
    },
    singleValue: (provided) => ({
      ...provided,
      color: "#333",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#aaa",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "0 8px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 99999,
    }),
  };

  const selectedOption = value && options && options.length > 0
    ? options.find((opt) => opt.value === value)
    : null;

    const filterOption = (option, rawInput) => {
      const filtered = matchSorter(options, rawInput, {
        keys: ["label"],
      });
      return filtered.some((f) => f.value === option.value);
    };
    

  const handleKeyDown = (event) => {
    if (event.key === 'Tab' && !isOpen) {
      event.preventDefault();
      setIsOpen(true);
    } else if (event.key === 'Tab' && isOpen) {
      // When dropdown is open and Tab is pressed, close dropdown and prevent selection
      event.preventDefault();
      setIsOpen(false);
      // Use setTimeout to ensure the dropdown closes before moving focus
      setTimeout(() => {
        const currentElement = event.target;
        // Try to find modal container first, if not found, use the entire document
        const container = currentElement.closest('.modal-container') || document.body;
        
        // Get all focusable elements in the container
        const focusableElements = Array.from(container.querySelectorAll('input, select, button, [tabindex]:not([tabindex="-1"])')).filter(el => {
          // Filter out elements that are not visible or disabled
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && !el.disabled;
        });
        
        // Find the current element's index
        const currentIndex = focusableElements.findIndex(el => el === currentElement || el.contains(currentElement));
        
        if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
          // Move to next element
          focusableElements[currentIndex + 1].focus();
        } else if (currentIndex === focusableElements.length - 1) {
          // If at the last element, move to the first
          focusableElements[0].focus();
        }
      }, 50);
    }
  };

  const handleBlur = () => {
    // Close dropdown when focus is lost
    setIsOpen(false);
  };


  
  return (
    <div className="common-select-st mb-0">
      {options && options.length > 0 ? (
        <Select
          ref={ref}
          name={name}
          value={selectedOption}
          onChange={(selected) => {
            onChange({ target: { name: selected?.label, value: selected?.value , code: selected?.code, id: selected?.id } });
          }}
          options={options}
          styles={customStyles}
          isSearchable={isSearchable}
          placeholder={placeholder}
          filterOption={filterOption} 
          components={{ DropdownIndicator }}
          menuIsOpen={isOpen}
          onMenuOpen={() => setIsOpen(true)}
          onMenuClose={() => setIsOpen(false)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          isDisabled={disabled}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          menuPlacement="auto"
        />
      ) : (
        <div className="text-muted border rounded ">No options available</div>
      )}
    </div>
  );
});

CommonSelect.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any,
      type_name: PropTypes.any,
    })
  ).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isSearchable: PropTypes.bool,
  disabled: PropTypes.bool,
};

CommonSelect.displayName = 'CommonSelect';

export default CommonSelect;
