import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertChildSchema, type InsertChild, type AvatarConfig } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Save, Loader2, Check, AlertCircle } from "lucide-react";
import { AvatarPreview } from "@/components/ui/avatar-preview";
import { useAuth } from "@/hooks/use-auth";
import { Subscription } from "@/lib/utils";

// Avatar options remain the same
const avatarTypes = [
  { id: "robot", name: "Robot" },
  { id: "animal", name: "Animal" },
  { id: "monster", name: "Monster" },
  { id: "hero", name: "Superhero" },
];

const avatarColors = [
  { id: "blue", name: "Blue" },
  { id: "green", name: "Green" },
  { id: "purple", name: "Purple" },
  { id: "orange", name: "Orange" },
  { id: "pink", name: "Pink" },
];

const avatarAccessories = [
  { id: "glasses", name: "Glasses" },
  { id: "hat", name: "Hat" },
  { id: "bowtie", name: "Bow Tie" },
  { id: "cape", name: "Cape" },
];

const defaultAvatar: AvatarConfig = {
  type: "robot",
  color: "blue",
  accessories: [],
  name: "",
};

export default function ChildDetailsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [previewConfig, setPreviewConfig] = useState<AvatarConfig>(defaultAvatar);

  const form = useForm<InsertChild>({
    resolver: zodResolver(insertChildSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: new Date().toISOString().split('T')[0],
      gender: "",
      parentId: user?.id || 0,
      medicalHistory: {},
      schoolInformation: {},
      avatar: {
        type: "robot",
        color: "blue",
        accessories: [],
        name: "",
      },
    },
    mode: "onChange", // Enable real-time validation
  });

  // Watch form values for validation state
  const { isValid, isDirty, errors } = form.formState;

  useEffect(() => {
    const subscription = form.watch((value: Partial<InsertChild>) => {
      if (value.avatar) {
        setPreviewConfig({
          type: value.avatar.type || defaultAvatar.type,
          color: value.avatar.color || defaultAvatar.color,
          accessories: selectedAccessories,
          name: value.avatar.name || defaultAvatar.name,
        });
      }
    }) as Subscription;
    return () => subscription.unsubscribe();
  }, [form.watch, selectedAccessories]);

  const createChild = useMutation({
    mutationFn: async (data: InsertChild) => {
      if (!user?.id) {
        throw new Error("You must be logged in to create a child profile");
      }

      const processedData = {
        ...data,
        parentId: user.id,
        dateOfBirth: new Date(data.dateOfBirth),
        avatar: {
          type: data.avatar?.type || defaultAvatar.type,
          color: data.avatar?.color || defaultAvatar.color,
          accessories: selectedAccessories,
          name: data.avatar?.name || defaultAvatar.name,
        },
      };

      const response = await apiRequest("POST", "/api/children", processedData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create child profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      toast({
        title: "Profile Created",
        description: "Child profile has been created successfully.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleAccessory = (accessoryId: string) => {
    setSelectedAccessories((current) => {
      const exists = current.includes(accessoryId);
      if (exists) {
        return current.filter((id) => id !== accessoryId);
      } else {
        return [...current, accessoryId];
      }
    });
  };

  const onSubmit = async (data: InsertChild) => {
    try {
      if (!user?.id) {
        throw new Error("You must be logged in to create a child profile");
      }

      const formattedData = {
        ...data,
        parentId: user.id,
        dateOfBirth: new Date(data.dateOfBirth).toISOString(),
        avatar: {
          type: data.avatar?.type || "robot",
          color: data.avatar?.color || "blue",
          accessories: selectedAccessories,
          name: data.avatar?.name || "",
        },
        medicalHistory: {},
        schoolInformation: {},
      };

      await createChild.mutateAsync(formattedData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error creating child profile",
        description: error instanceof Error ? error.message : "Failed to create child profile",
        variant: "destructive",
      });
    }
  };

  // Helper function to get field validation state
  const getFieldState = (fieldName: keyof InsertChild) => {
    const fieldState = form.getFieldState(fieldName);
    return {
      isValid: !fieldState.invalid && fieldState.isDirty,
      isInvalid: fieldState.invalid && fieldState.isDirty,
      error: fieldState.error?.message,
    };
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Child Profile</h1>
          <p className="text-muted-foreground">
            Enter child details and customize their avatar
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the child's personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => {
                    const { isValid, isInvalid, error } = getFieldState("firstName");
                    return (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              className={`pr-8 ${
                                isValid ? "border-green-500" : isInvalid ? "border-red-500" : ""
                              }`}
                            />
                            {isValid && (
                              <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                            )}
                            {isInvalid && (
                              <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Use letters, spaces, and hyphens only
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => {
                    const { isValid, isInvalid, error } = getFieldState("lastName");
                    return (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              className={`pr-8 ${
                                isValid ? "border-green-500" : isInvalid ? "border-red-500" : ""
                              }`}
                            />
                            {isValid && (
                              <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                            )}
                            {isInvalid && (
                              <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Use letters, spaces, and hyphens only
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => {
                    const { isValid, isInvalid, error } = getFieldState("dateOfBirth");
                    return (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="date"
                              {...field}
                              max={new Date().toISOString().split('T')[0]}
                              className={`${
                                isValid ? "border-green-500" : isInvalid ? "border-red-500" : ""
                              }`}
                              onChange={(e) => {
                                const date = new Date(e.target.value);
                                if (!isNaN(date.getTime())) {
                                  field.onChange(e.target.value);
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Child must be between 0 and 18 years old
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => {
                    const { isValid, isInvalid, error } = getFieldState("gender");
                    return (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`${
                                isValid ? "border-green-500" : isInvalid ? "border-red-500" : ""
                              }`}
                            >
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avatar Customization</CardTitle>
                <CardDescription>
                  Personalize the child's virtual character
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center mb-6">
                  <AvatarPreview config={previewConfig} size="lg" />
                </div>

                <FormField
                  control={form.control}
                  name="avatar.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Character Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setPreviewConfig((prev) => ({
                            ...prev,
                            type: value,
                          }));
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select character type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {avatarTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="avatar.color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color Theme</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setPreviewConfig((prev) => ({
                            ...prev,
                            color: value,
                          }));
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {avatarColors.map((color) => (
                            <SelectItem key={color.id} value={color.id}>
                              {color.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Accessories</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {avatarAccessories.map((accessory) => (
                      <Button
                        key={accessory.id}
                        type="button"
                        variant={selectedAccessories.includes(accessory.id) ? "default" : "outline"}
                        onClick={() => toggleAccessory(accessory.id)}
                        className="w-full"
                      >
                        {accessory.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="avatar.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Give your avatar a name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createChild.isPending || !isValid || !isDirty}
          >
            {createChild.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Profile
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}