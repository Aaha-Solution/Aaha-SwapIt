const getPagination = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset
  };
};

const formatPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

module.exports = {
  getPagination,
  formatPaginationMeta
};
