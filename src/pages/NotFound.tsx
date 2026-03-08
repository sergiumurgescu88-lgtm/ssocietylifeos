import { useLocation, Link } from "react-router-dom";
import { Home, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center space-y-6"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>

        <div>
          <h1 className="text-6xl font-bold gradient-text mb-2">404</h1>
          <p className="text-lg font-medium text-foreground">Page not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            The page <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{location.pathname}</code> doesn't exist.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Link to="/dashboard">
            <Button className="gradient-primary text-primary-foreground gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
