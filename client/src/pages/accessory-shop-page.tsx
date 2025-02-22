import { useQuery, useMutation } from "@tanstack/react-query";
import { ShopItemSelect, OwnedItemSelect } from "@shared/schema";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GiBowTie, GiCape, GiSparkles } from "react-icons/gi";
import { FaGlasses, FaHatCowboy } from "react-icons/fa";
import { apiRequest, queryClient } from "@/lib/queryClient";

const accessoryIcons = {
  glasses: FaGlasses,
  hat: FaHatCowboy,
  bowtie: GiBowTie,
  cape: GiCape,
};

export default function AccessoryShopPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: shopItems, isLoading: isLoadingItems } = useQuery<ShopItemSelect[]>({
    queryKey: ["/api/shop/items"],
  });

  const { data: ownedItems, isLoading: isLoadingOwned } = useQuery<OwnedItemSelect[]>({
    queryKey: ["/api/shop/owned-items"],
    enabled: !!user,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await apiRequest("POST", "/api/shop/purchase", { itemId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/owned-items"] });
      toast({
        title: "Purchase successful!",
        description: "The item has been added to your collection.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isOwned = (itemId: number) => {
    return ownedItems?.some((owned) => owned.itemId === itemId);
  };

  if (isLoadingItems || isLoadingOwned) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading shop items...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Accessory Shop</h1>
          <p className="text-muted-foreground">
            Customize your avatar with unique accessories
          </p>
        </div>
      </div>

      {/* Weekly Free Items Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <GiSparkles className="h-6 w-6 mr-2 text-yellow-500" />
            Weekly Free Items
          </CardTitle>
          <CardDescription>
            Get these items for free this week only!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shopItems
              ?.filter((item) => item.isFreeWeekly)
              .map((item) => {
                const Icon = accessoryIcons[item.type as keyof typeof accessoryIcons];
                return (
                  <Card key={item.id} className="relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                    <CardHeader>
                      <Badge className="absolute top-2 right-2 bg-yellow-500">
                        Free This Week!
                      </Badge>
                      <div className="flex items-center justify-center h-24">
                        {Icon && <Icon className="w-16 h-16 text-primary" />}
                      </div>
                      <CardTitle className="text-center">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        {item.description}
                      </p>
                      <Button
                        className="w-full"
                        disabled={isOwned(item.id) || purchaseMutation.isPending}
                        onClick={() => purchaseMutation.mutate(item.id)}
                      >
                        {isOwned(item.id)
                          ? "Owned"
                          : purchaseMutation.isPending
                          ? "Getting Item..."
                          : "Get For Free!"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Regular Shop Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {shopItems
          ?.filter((item) => !item.isFreeWeekly)
          .map((item) => {
            const Icon = accessoryIcons[item.type as keyof typeof accessoryIcons];
            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-center h-24">
                    {Icon && <Icon className="w-16 h-16 text-primary" />}
                  </div>
                  <CardTitle className="text-center">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {item.description}
                  </p>
                  <div className="text-center font-bold mb-4">
                    {item.price} Credits
                  </div>
                  <Button
                    className="w-full"
                    disabled={isOwned(item.id) || purchaseMutation.isPending}
                    onClick={() => purchaseMutation.mutate(item.id)}
                  >
                    {isOwned(item.id)
                      ? "Owned"
                      : purchaseMutation.isPending
                      ? "Purchasing..."
                      : "Purchase"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
