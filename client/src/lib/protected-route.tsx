import { useAuth } from "@/hooks/use-auth";
import { Redirect, Route } from "wouter";
import { Nav } from "@/components/nav";
import { LoadingScreen } from "@/components/ui/loading-screen";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <LoadingScreen message="Preparing your learning environment..." />
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <div className="min-h-screen flex flex-col">
        <Nav />
        <Component />
      </div>
    </Route>
  );
}