import { AvatarConfig } from "@shared/schema";
import { FaRobot, FaPaw, FaGhost, FaMask } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface AvatarPreviewProps {
  config: AvatarConfig;
  size?: "sm" | "md" | "lg";
}

const avatarSizes = {
  sm: "h-12 w-12",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

const avatarIcons = {
  robot: FaRobot,
  animal: FaPaw,
  monster: FaGhost,
  hero: FaMask,
};

const avatarColors = {
  blue: "text-blue-500",
  green: "text-green-500",
  purple: "text-purple-500",
  orange: "text-orange-500",
  pink: "text-pink-500",
};

export function AvatarPreview({ config, size = "md" }: AvatarPreviewProps) {
  const Icon = avatarIcons[config.type as keyof typeof avatarIcons] || FaRobot;
  const colorClass = avatarColors[config.color as keyof typeof avatarColors] || "text-blue-500";
  const sizeClass = avatarSizes[size];

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={cn(
          "rounded-full bg-accent/10 flex items-center justify-center",
          sizeClass
        )}
      >
        <Icon className={cn("w-2/3 h-2/3", colorClass)} />
      </div>
      {config.accessories.length > 0 && (
        <div className="absolute -bottom-2 -right-2 text-xs font-medium bg-primary/10 rounded-full px-2 py-1">
          {config.accessories.length} items
        </div>
      )}
    </div>
  );
}
