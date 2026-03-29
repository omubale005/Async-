import { Home } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold text-gray-200">404</div>
        <h1 className="text-2xl font-semibold text-gray-900">Page Not Found</h1>
        <p className="text-gray-500 max-w-md">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4">
          <Button
            onClick={() => navigate("/")}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
