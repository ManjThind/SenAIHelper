import { AvatarConfig } from "@shared/schema";
import { FaRobot, FaPaw, FaGhost, FaMask, FaGlasses, FaHatCowboy, FaUserAstronaut } from "react-icons/fa";
import { GiBowTie, GiCape, GiSparkles } from "react-icons/gi";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AvatarPreviewProps {
  config: AvatarConfig;
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

const avatarSizes = {
  sm: "h-12 w-12",
  md: "h-24 w-24",
  lg: "h-32 w-32",
  xl: "h-48 w-48"
};

const avatarIcons = {
  robot: FaRobot,
  animal: FaPaw,
  monster: FaGhost,
  hero: FaMask,
  astronaut: FaUserAstronaut
};

const accessoryIcons = {
  glasses: FaGlasses,
  hat: FaHatCowboy,
  bowtie: GiBowTie,
  cape: GiCape
};

const avatarColors = {
  blue: "text-blue-500",
  green: "text-green-500",
  purple: "text-purple-500",
  orange: "text-orange-500",
  pink: "text-pink-500",
  rainbow: "animate-rainbow"
};

const backgroundEffects = {
  sparkles: <GiSparkles className="absolute -z-10 w-full h-full opacity-20 text-yellow-400 animate-pulse" />,
  none: null
};

export function AvatarPreview({ config, size = "md", animate = true }: AvatarPreviewProps) {
  const Icon = avatarIcons[config.type as keyof typeof avatarIcons] || FaRobot;
  const colorClass = avatarColors[config.color as keyof typeof avatarColors] || "text-blue-500";
  const sizeClass = avatarSizes[size];

  const avatarAnimation = animate ? {
    initial: { scale: 0.9, rotate: -5 },
    animate: { 
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  } : {};

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        {...avatarAnimation}
        className={cn(
          "rounded-full bg-accent/10 flex items-center justify-center relative overflow-visible",
          sizeClass
        )}
      >
        {/* Background Effect */}
        {backgroundEffects[config.effect as keyof typeof backgroundEffects]}

        {/* Main Avatar */}
        <Icon className={cn("w-2/3 h-2/3", colorClass)} />

        {/* Accessories */}
        {config.accessories?.map((accessory, index) => {
          const AccessoryIcon = accessoryIcons[accessory as keyof typeof accessoryIcons];
          if (!AccessoryIcon) return null;

          return (
            <AccessoryIcon
              key={accessory}
              className={cn(
                "absolute w-1/3 h-1/3",
                {
                  "top-0 right-0": accessory === "hat",
                  "top-1/2 left-1/2 -translate-x-1/2": accessory === "glasses",
                  "bottom-0 left-1/2 -translate-x-1/2": accessory === "bowtie",
                  "top-0 right-0 -rotate-45": accessory === "cape"
                }
              )}
            />
          );
        })}
      </motion.div>

      {/* Accessories Counter */}
      {config.accessories?.length > 0 && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-2 -right-2 text-xs font-medium bg-primary/10 rounded-full px-2 py-1"
        >
          {config.accessories.length} items
        </motion.div>
      )}

      {/* Avatar Name */}
      {config.name && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium"
        >
          {config.name}
        </motion.div>
      )}
    </div>
  );
}