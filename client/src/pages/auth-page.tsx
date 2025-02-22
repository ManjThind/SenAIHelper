import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

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
      fullName: "",
      role: "parent",
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
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
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rememberMe" 
                      {...loginForm.register("rememberMe")}
                    />
                    <Label htmlFor="rememberMe">Remember me</Label>
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