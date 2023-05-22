import React, { useMemo } from "react";
import { useTable, useGlobalFilter, usePagination, useSortBy } from "react-table";

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => {
  return (
    <div>
      <input
        className="form-control"
        value={globalFilter || ""}
        onChange={(e) => setGlobalFilter(e.target.value || undefined)}
        placeholder="Procurar..."
      />
    </div>
  );
};

const Pagination = (props) => {
  return (
    <div className="pagination-container mb-2 d-flex justify-content-center justify-content-md-start">
      <ul className="pagination mb-0">
        <li className={`page-item ${!props.canPreviousPage && `disabled`}`}>
          <button
            className={`page-link`}
            onClick={(e) => {
              e.preventDefault();
              props.previousPage();
            }}
            disabled={!props.canPreviousPage}
          >
            {`<`}
          </button>
        </li>
        {!props.disablePaginationCount &&
          Array.from(Array(props.pageCount).keys()).map((page, index) => (
            <li className={`page-item ${page === props.pageIndex && `disabled`}`} key={`page-${index + 1}`}>
              <button
                className="page-link"
                onClick={(e) => {
                  e.preventDefault();
                  props.gotoPage(page);
                }}
              >
                {page + 1}
              </button>
            </li>
          ))}
        <li className={`page-item ${!props.canNextPage && `disabled`}`}>
          <button
            className="page-link"
            onClick={(e) => {
              e.preventDefault();
              props.nextPage();
            }}
          >
            {`>`}
          </button>
        </li>
      </ul>
    </div>
  );
};

const Table = ({
  data,
  columns,
  customPageSize,
  sortByColumn,
  generateXlsx,
  disablePagination,
  disableFilter,
  hideHeader,
  enableBottomPagination,
  disablePaginationCount,
}) => {
  const memoData = useMemo(() => data, [data]);
  const memoColumns = useMemo(() => columns || Object.keys(data[0]).map((header) => ({ Header: header, accessor: header })), [columns, data]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { globalFilter, pageIndex, pageSize },
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
  } = useTable(
    {
      columns: memoColumns,
      data: memoData,
      initialState: {
        pageIndex: 0,
        pageSize: customPageSize || 10,
        sortBy: sortByColumn || [],
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const filteredRows = rows.filter((row) =>
    Object.values(row.values).some((cellValue) =>
      String(cellValue)
        .toLowerCase()
        .includes((globalFilter || "").toLowerCase())
    )
  );

  return (
    <div className="table-responsive">
      {!disablePagination && (
        <div className={`d-flex flex-column my-2 mx-1  justify-content-between`}>
          <Pagination
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
            pageIndex={pageIndex}
            pageCount={pageCount}
            pageSize={pageSize}
            pageOptions={pageOptions}
            gotoPage={gotoPage}
            nextPage={nextPage}
            previousPage={previousPage}
            setPageSize={setPageSize}
            disablePaginationCount={disablePaginationCount}
          />
        </div>
      )}
      {!disableFilter && <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />}
      {generateXlsx && (
        <div className="flex-fill text-end ms-2">
          <button
            className="btn btn-outline-success mt-auto mx-auto"
            onClick={(e) => {
              e.preventDefault();
              generateXlsx();
            }}
          >
            <i className="bi bi-filetype-xlsx fs-3"></i>
          </button>
        </div>
      )}

      <table className="table mb-0" {...getTableProps()}>
        <thead className={hideHeader ? "d-none" : ""}>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps([
                    column.getSortByToggleProps(),
                    {
                      className: column.className,
                      style: column.style,
                    },
                  ])}
                >
                  <div className={`rounded-2 p-1`}>
                    {column.render("Header")}{" "}
                    <span className="align-middle">
                      {!column.disableSortBy ? (
                        column.isSorted ? (
                          column.isSortedDesc ? (
                            <i className="bi bi-caret-down-fill"></i>
                          ) : (
                            <i className="bi bi-caret-up-fill"></i>
                          )
                        ) : (
                          <i className="bi bi-filter"></i>
                        )
                      ) : (
                        ""
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {filteredRows.length > 0 ? (
            page.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td
                        {...cell.getCellProps([
                          {
                            className: cell.column.className, // pay attention to this
                            style: cell.column.style,
                            // set here your other custom props
                          },
                        ])}
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={memoColumns.length}>Nenhum resultado encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
      {enableBottomPagination && (
        <div className="mt-3 mx-1">
          <Pagination
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
            pageIndex={pageIndex}
            pageCount={pageCount}
            pageSize={pageSize}
            pageOptions={pageOptions}
            gotoPage={gotoPage}
            nextPage={nextPage}
            previousPage={previousPage}
            setPageSize={setPageSize}
          />
        </div>
      )}
    </div>
  );
};

export default Table;
