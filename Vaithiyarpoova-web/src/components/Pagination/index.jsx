import React, { useMemo, useState } from "react";
import "./Pagination.css";
import PropTypes from "prop-types";

// Arrow Components
const RightArrow = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const LeftArrow = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

// Utility functions
const DOTS = "•••";

const range = (start, end) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

// Hook for Pagination Range Calculation
const usePagination = ({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage,
}) => {
  return useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize);
    const totalPageButtons = siblingCount + 5;

    if (totalPageButtons >= totalPageCount) {
      return range(1, totalPageCount);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPageCount);

    const shouldShowLeftDots = leftSiblingIndex > siblingCount + 1;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS + " Next", totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + siblingCount;
      const rightRange = range(totalPageCount - rightItemCount + 1, totalPageCount);
      return [firstPageIndex, "Previous " + DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, "Previous " + DOTS, ...middleRange, DOTS + " Next", lastPageIndex];
    }

    return [];
  }, [totalCount, pageSize, siblingCount, currentPage]);
};

// Main Pagination Component
const Pagination = ({
  count: totalCount,
  page: currentPage,
  onChange,
  pageSize = 15,
  isGotoRequired = false,
}) => {
  const siblingCount = 1;
  const [goto, setGoto] = useState("");

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  const lastPage = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);

  if (currentPage === 0 || paginationRange.length < 2) return null;

  const onNext = () => {
    if (currentPage < lastPage) {
      onChange(currentPage + 1);
      setGoto("");
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onChange(currentPage - 1);
      setGoto("");
    }
  };

  const handleSkipArrowClick = (pageLabel) => {
    if (pageLabel.includes("Next")) {
      const nextPage = Math.min(currentPage + siblingCount * 2 + 1, lastPage);
      onChange(nextPage);
    } else {
      const prevPage = Math.max(currentPage - siblingCount * 2 - 1, 1);
      onChange(prevPage);
    }
    setGoto("");
  };

  return (
    <nav className="pagination_wrapper">
      {/* Left Arrow */}
      <button
        className="page_arrow"
        disabled={currentPage === 1}
        aria-label="Previous"
        onClick={onPrevious}
      >
        <LeftArrow />
      </button>

      {/* Page Numbers + Dots */}
      {paginationRange.map((pageNumber, index) => {
        if (typeof pageNumber === "string" && pageNumber.includes(DOTS)) {
          return (
              <button key={`dots-${index+1}`}
                onClick={() => handleSkipArrowClick(pageNumber)}
                className="page_number_btn page_dots"
              > 
                <span className="position-relative" style={{top:"4px"}}>
                  {DOTS}
                  </span>
              </button>
          );
        }

        return (
          <button
            key={pageNumber}
            onClick={() => {
              onChange(pageNumber);
              setGoto("");
            }}
            className={`page_number_btn ${pageNumber === currentPage ? "active_page" : ""}`}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* Right Arrow */}
      <button
        disabled={currentPage === lastPage}
        className="page_arrow"
        aria-label="Next"
        onClick={onNext}
      >
        <RightArrow />
      </button>

      {/* Optional Go-To Input */}
      {isGotoRequired && (
        <div className="go_to_wrapper">
          <span>Go to</span>
          <input
            type="number"
            value={goto}
            min={1}
            max={lastPage}
            onChange={(e) =>
              setGoto(parseInt(e.target.value.replace(/\D/g, ""), 10) || "")
            }
            onKeyDown={(e) => {
              if (e.key.toLowerCase() === "e") e.preventDefault();
              if (e.key === "Enter" && goto >= 1 && goto <= lastPage) {
                onChange(goto);
                setGoto("");
              }
            }}
            className="go_to_input"
          />
          <span>page</span>
        </div>
      )}
    </nav>
  );
};

// Props validation
Pagination.propTypes = {
  count: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  isGotoRequired: PropTypes.bool,
};

export default Pagination;
