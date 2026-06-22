import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl font-bold text-red-600 mb-2">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-6">
        The page you're looking for does not exist.
      </p>
      <Button
        onClick={() => navigate(-1)}
        variant={'link'}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
      >
        Back to page
      </Button>
    </div>
  );
};

export default NotFound;
