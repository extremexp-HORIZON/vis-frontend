import { RouterProvider } from 'react-router-dom';
import './App.css';
import MainRoutes from './routes';
import { clearExpiredLocalStorage } from './shared/utils/localStorageCache';
import { useEffect } from 'react';

const App = () => {

  useEffect(() => {
    // Run once immediately
    clearExpiredLocalStorage(['compare-', 'experiment-', 'workflows-']);

    // Schedule cleanup every 10 min
    const interval = setInterval(() => {
      clearExpiredLocalStorage(['compare-', 'experiment-', 'workflows-']);
    }, 10 * 60 * 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <RouterProvider router={MainRoutes} />
  );
};

export default App;
