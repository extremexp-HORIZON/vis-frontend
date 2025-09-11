import { Pagination } from '@mui/material';

const PaginationComponent = ({ currentPage, totalPages, setCurrentPage }: {currentPage: number; totalPages: number; setCurrentPage: (value: number) => void}) => {

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    if (value !== currentPage) {
      setCurrentPage(value);
    }
  };

  return (
    <Pagination
      count={totalPages}
      page={currentPage}
      onChange={handleChange}
      color="primary"
      shape="circular"
      siblingCount={1}
      boundaryCount={1}
      showFirstButton
      showLastButton
    />
  );
};

export default PaginationComponent;
