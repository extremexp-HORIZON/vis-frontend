import { Pagination } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { setCurrentPage } from '../../../../store/slices/workflowPageSlice';

const PaginationComponent = () => {
  const dispatch = useAppDispatch();
  const { tab } = useAppSelector(state => state.workflowPage);

  const currentPage = tab?.workflowTasks.dataExploration?.controlPanel?.currentPage || 1;
  const totalPages = tab?.workflowTasks.dataExploration?.controlPanel?.totalPages || 1;

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    if (value !== currentPage) {
      dispatch(setCurrentPage(value));
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
