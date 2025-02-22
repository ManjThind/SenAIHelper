import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Users, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

export function Nav() {
  const { logoutMutation } = useAuth();

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="font-semibold">SEN Assessment Tool</div>
          <Link href="/children">
            <Button variant="ghost" size="sm" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Children
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="ghost" size="sm" className="flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Accessory Shop
            </Button>
          </Link>
        </div>
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