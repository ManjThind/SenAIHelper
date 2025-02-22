import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Brain, Users, FileText, Activity } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  Icon: React.ElementType;
  action?: string;
  highlight?: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to SEN Assessment Tool",
    description: "Let's take a quick tour of the key features that will help you assess and track development.",
    Icon: Brain,
    action: "Next",
  },
  {
    title: "Create Child Profiles",
    description: "Start by adding profiles for the children you want to assess. Click 'Add Child Profile' to create your first profile.",
    Icon: Users,
    action: "Go to Profile Creation",
    highlight: "create-child-button",
  },
  {
    title: "Conduct Assessments",
    description: "Use our AI-powered tools to conduct comprehensive assessments including facial analysis, voice analysis, and interactive tests.",
    Icon: Activity,
    action: "Next",
    highlight: "new-assessment-button",
  },
  {
    title: "View Reports",
    description: "Access detailed reports and track progress over time to make informed decisions about development strategies.",
    Icon: FileText,
    action: "Finish Tour",
    highlight: "reports-section",
  },
];

export function OnboardingTutorial() {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem(`tutorial-seen-${user?.id}`);
    if (tutorialSeen) {
      setHasSeenTutorial(true);
      setOpen(false);
    }
  }, [user?.id]);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      completeTutorial();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const completeTutorial = () => {
    if (user?.id) {
      localStorage.setItem(`tutorial-seen-${user.id}`, 'true');
    }
    setHasSeenTutorial(true);
    setOpen(false);
  };

  const highlightElement = () => {
    const step = steps[currentStep];
    if (step.highlight) {
      const element = document.querySelector(`.${step.highlight}`);
      if (element) {
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      }
    }
  };

  useEffect(() => {
    highlightElement();
    return () => {
      // Cleanup previous highlights
      document.querySelectorAll('.ring-2').forEach(el => {
        el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      });
    };
  }, [currentStep]);

  if (hasSeenTutorial) return null;

  const CurrentIcon = steps[currentStep].Icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-full",
                  "bg-primary/10"
                )}>
                  <CurrentIcon className="w-6 h-6 text-primary" />
                </div>
                <DialogTitle>{steps[currentStep].title}</DialogTitle>
              </div>
              <DialogDescription>
                {steps[currentStep].description}
              </DialogDescription>
            </DialogHeader>
          </motion.div>
        </AnimatePresence>

        <DialogFooter className="mt-6">
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    currentStep === index ? "bg-primary" : "bg-primary/30"
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={completeTutorial}
              >
                Skip Tour
              </Button>
              <Button
                onClick={handleNext}
              >
                {steps[currentStep].action}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}