import React from 'react';

function Pagination({ pagination, onPageChange }) {

    if (!pagination || pagination.total <= 0) return null;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.lastPage) {
            onPageChange(page);
        }
    };

    const getPageRange = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        range.push(1);

        for (let i = pagination.currentPage - delta; i <= pagination.currentPage + delta; i++) {
            if (i > 1 && i < pagination.lastPage) {
                range.push(i);
            }
        }

        if (pagination.lastPage > 1) {
            range.push(pagination.lastPage);
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    return (
        <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
                Showing <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.perPage + 1}
                </span> to <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.perPage, pagination.total)}
                </span> of <span className="font-medium">{pagination.total}</span> results
            </div>
            <nav className="flex items-center">
                <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        pagination.currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    Previous
                </button>
                <div className="hidden md:flex">
                    {getPageRange().map((number, index) =>
                        number === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-4 py-2 text-sm text-gray-700">...</span>
                        ) : (
                            <button
                                key={`page-${number}`}
                                onClick={() => handlePageChange(number)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                    pagination.currentPage === number
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {number}
                            </button>
                        )
                    )}
                </div>
                <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.lastPage}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        pagination.currentPage === pagination.lastPage
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    Next
                </button>
            </nav>
        </div>
    );
}

export default Pagination;
