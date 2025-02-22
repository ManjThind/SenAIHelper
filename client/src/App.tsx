import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { OnboardingTutorial } from "@/components/onboarding-tutorial";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AssessmentPage from "@/pages/assessment-page";
import FacialAnalysisPage from "@/pages/facial-analysis-page";
import VoiceAnalysisPage from "@/pages/voice-analysis-page";
import InteractiveAssessmentPage from "@/pages/interactive-assessment-page";
import AssessmentTypePage from "@/pages/assessment-type-page";
import ChildDetailsPage from "@/pages/child-details-page";
import ChildrenListPage from "@/pages/children-list-page";
import AccessoryShopPage from "@/pages/accessory-shop-page";
import ReportsHomePage from "@/pages/reports-home-page";
import ReportPage from "@/pages/report-page";
import WritingAssessmentPage from "@/pages/writing-assessment-page";
import AttentionAssessmentPage from "@/pages/attention-assessment-page";
import AIDiagnosticPage from "@/pages/ai-diagnostic-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/assessment/select-type" component={AssessmentTypePage} />
      <ProtectedRoute path="/assessment/:id" component={AssessmentPage} />
      <ProtectedRoute path="/assessment/:id/facial" component={FacialAnalysisPage} />
      <ProtectedRoute path="/assessment/:id/voice" component={VoiceAnalysisPage} />
      <ProtectedRoute path="/assessment/:id/interactive" component={InteractiveAssessmentPage} />
      <ProtectedRoute path="/assessment/:id/writing" component={WritingAssessmentPage} />
      <ProtectedRoute path="/assessment/:id/attention" component={AttentionAssessmentPage} />
      <ProtectedRoute path="/assessment/:id/ai-diagnostic" component={AIDiagnosticPage} />
      <ProtectedRoute path="/child/new" component={ChildDetailsPage} />
      <ProtectedRoute path="/children" component={ChildrenListPage} />
      <ProtectedRoute path="/shop" component={AccessoryShopPage} />
      <ProtectedRoute path="/reports" component={ReportsHomePage} />
      <ProtectedRoute path="/report/:id" component={ReportPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <OnboardingTutorial />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;