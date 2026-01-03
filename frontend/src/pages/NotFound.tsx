import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, HomeIcon, MapIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';

const NotFound = () => {
  useEffect(() => {
    document.title = '404 - Page Not Found | DePIN Connect';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-fade-in">
      <div className="text-center px-4">
        <div className="mb-8">
          <ExclamationTriangleIcon className="h-24 w-24 text-yellow-500 mx-auto animate-pulse-slow" />
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="primary" className="w-full sm:w-auto">
              <HomeIcon className="h-5 w-5 mr-2 inline" />
              Go to Marketplace
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto">
              <MapIcon className="h-5 w-5 mr-2 inline" />
              Provider Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          Error Code: 404 | Lost in the DePIN network
        </div>
      </div>
    </div>
  );
};

export default NotFound;
