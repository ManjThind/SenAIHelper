import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, BookOpen, Pencil, Calculator, Music, Atom } from "lucide-react";

const characters = [
  {
    icon: Brain,
    message: "Getting those brain cells ready...",
    color: "text-blue-500"
  },
  {
    icon: BookOpen,
    message: "Opening the book of knowledge...",
    color: "text-green-500"
  },
  {
    icon: Pencil,
    message: "Drawing up some fun...",
    color: "text-purple-500"
  },
  {
    icon: Calculator,
    message: "Calculating awesome activities...",
    color: "text-orange-500"
  },
  {
    icon: Music,
    message: "Composing educational harmony...",
    color: "text-pink-500"
  },
  {
    icon: Atom,
    message: "Discovering new learning adventures...",
    color: "text-teal-500"
  }
];

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % characters.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const character = characters[currentIndex];
  const Icon = character.icon;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center space-y-4"
          >
            <Icon className={`w-24 h-24 ${character.color}`} />
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-xl font-medium"
            >
              {message || character.message}
            </motion.p>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full ${character.color}`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
