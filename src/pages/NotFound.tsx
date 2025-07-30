import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-cairo flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="relative">
              <AlertTriangle className="h-24 w-24 text-red-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">404</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">Game Not Found</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Oops! The math skill you're looking for doesn't exist. Don't
              worry, there are plenty of other exciting challenges waiting for
              you!
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              <Home className="mr-2 h-5 w-5" />
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
