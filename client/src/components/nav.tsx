import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Nav() {
  const { logoutMutation } = useAuth();

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="font-semibold">SEN Assessment Tool</div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            "Logging out..."
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </>
          )}
        </Button>
      </div>
    </nav>
  );
}
