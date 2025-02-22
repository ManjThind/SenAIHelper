import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Login/Register Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Welcome Back</h2>
                  <p className="text-gray-500">
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
                  <p className="text-gray-500">
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
      <div className="hidden lg:flex items-center justify-center bg-muted/5">
        <div className="text-center">
          <img
            src="/SiliconSquaresLogoContact.png"
            alt="Silicon Squares Logo"
            className="w-48 h-48 object-contain mx-auto"
          />
          <h1 className="text-4xl font-bold mt-8 mb-4">
            AI-Powered SEN Assessment Tool
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Helping identify early signs of autism and ADHD through advanced facial
            analysis and behavioral assessment.
          </p>
        </div>
      </div>
    </div>
  );
}