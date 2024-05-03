import React, { useState } from "react";
import "./Pagination.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

const Pagination = ({
  page,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
}: PaginationProps) => {
  const [rowsPerPageValue, setRowsPerPageValue] = useState(rowsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(page - Math.floor(maxPagesToShow / 2), 1);
    const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li
          key={i}
          className={i === page ? "active" : ""}
          onClick={() => onPageChange(i)}>
          {i}
        </li>
      );
    }

    return pageNumbers;
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPageValue(newRowsPerPage);
    onRowsPerPageChange(newRowsPerPage);
  };

  return (
    <div className="pagination">
      <div className="rows-per-page">
        <label htmlFor="rows-per-page">Rows per page:</label>
        <select
          id="rows-per-page"
          value={rowsPerPageValue}
          onChange={handleRowsPerPageChange}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
        </select>
      </div>
      <ul>
        <li
          className={page === 1 ? "disabled" : ""}
          onClick={() => onPageChange(1)}>
          {"<<"}
        </li>
        <li
          className={page === 1 ? "disabled" : ""}
          onClick={() => onPageChange(page - 1)}>
          {"<"}
        </li>
        {renderPageNumbers()}
        <li
          className={page === totalPages ? "disabled" : ""}
          onClick={() => onPageChange(page + 1)}>
          {">"}
        </li>
        <li
          className={page === totalPages ? "disabled" : ""}
          onClick={() => onPageChange(totalPages)}>
          {">>"}
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
