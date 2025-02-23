import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect, useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [resetToken, setResetToken] = useState<string | null>(null);

  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      role: "parent",
    },
  });

  const resetPasswordForm = useForm({
    defaultValues: {
      email: "",
    },
  });

  const newPasswordForm = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const requestResetMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest("POST", "/api/request-password-reset", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reset Instructions Sent",
        description: data.message,
      });
      if (data.debug?.resetToken) {
        // Only in development - remove in production
        setResetToken(data.debug.resetToken);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/reset-password", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password",
      });
      setResetToken(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen w-screen max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Login/Register Form */}
      <div className="flex items-center justify-center p-12">
        <div className="w-full max-w-xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="reset">Reset Password</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Welcome Back</h2>
                  <p className="text-muted-foreground">
                    Login to access your SEN assessment dashboard
                  </p>
                </div>

                <form
                  onSubmit={loginForm.handleSubmit((data) =>
                    loginMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      {...loginForm.register("username")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...loginForm.register("password")}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="rememberMe" 
                        {...loginForm.register("rememberMe")}
                      />
                      <Label htmlFor="rememberMe">Remember me</Label>
                    </div>
                    <Button
                      variant="link"
                      type="button"
                      className="text-sm"
                      onClick={() => setLocation("/auth?tab=reset")}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Create an Account</h2>
                  <p className="text-muted-foreground">
                    Register to start using the SEN assessment tool
                  </p>
                </div>

                <form
                  onSubmit={registerForm.handleSubmit((data) =>
                    registerMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      {...registerForm.register("fullName")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...registerForm.register("email")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      {...registerForm.register("username")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...registerForm.register("password")}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Register"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="reset">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
                  <p className="text-muted-foreground">
                    {resetToken 
                      ? "Enter your new password"
                      : "Enter your email to receive password reset instructions"}
                  </p>
                </div>

                {!resetToken ? (
                  <form
                    onSubmit={resetPasswordForm.handleSubmit((data) =>
                      requestResetMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...resetPasswordForm.register("email")}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={requestResetMutation.isPending}
                    >
                      {requestResetMutation.isPending 
                        ? "Sending Instructions..." 
                        : "Send Reset Instructions"}
                    </Button>
                  </form>
                ) : (
                  <form
                    onSubmit={newPasswordForm.handleSubmit((data) => {
                      if (data.password !== data.confirmPassword) {
                        toast({
                          title: "Error",
                          description: "Passwords do not match",
                          variant: "destructive",
                        });
                        return;
                      }
                      resetPasswordMutation.mutate({ 
                        token: resetToken,
                        newPassword: data.password 
                      });
                    })}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...newPasswordForm.register("password")}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...newPasswordForm.register("confirmPassword")}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending 
                        ? "Resetting Password..." 
                        : "Reset Password"}
                    </Button>
                  </form>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Logo and Text */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-muted/5 px-12">
        <img
          src="/attached_assets/Copy of Copy of sILICON Square_1740261799440.png"
          alt="Silicon Squares Logo"
          className="w-64 h-64 object-contain mb-12"
        />
        <h1 className="text-5xl font-bold mb-6 text-center leading-tight">
          AI-Powered<br />
          SEN Assessment Tool
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl text-center">
          Helping identify early signs of autism and ADHD through advanced facial
          analysis and behavioral assessment.
        </p>
      </div>
    </div>
  );
}