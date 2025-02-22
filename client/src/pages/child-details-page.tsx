import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
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
import { insertChildSchema, type InsertChild } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft } from "lucide-react";
import { AvatarPreview } from "@/components/ui/avatar-preview";

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

export default function ChildDetailsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [previewConfig, setPreviewConfig] = useState({
    type: "robot",
    color: "blue",
    accessories: [] as string[],
    name: "",
  });

  const form = useForm<InsertChild>({
    resolver: zodResolver(insertChildSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: new Date().toISOString(),
      gender: "",
      medicalHistory: {},
      schoolInformation: {},
      avatar: {
        type: "robot",
        color: "blue",
        accessories: [],
        name: "",
      },
    },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.avatar) {
        setPreviewConfig({
          ...value.avatar,
          accessories: selectedAccessories,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, selectedAccessories]);

  const createChild = useMutation({
    mutationFn: async (data: InsertChild) => {
      const res = await apiRequest("POST", "/api/children", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      toast({
        title: "Child Profile Created",
        description: "The child profile has been created successfully",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not create child profile",
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

  const onSubmit = (data: InsertChild) => {
    createChild.mutate({
      ...data,
      avatar: {
        ...data.avatar,
        accessories: selectedAccessories,
      },
    });
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the child's personal details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value?.split('T')[0]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                  )}
                />

                <Button type="submit" className="w-full">
                  Create Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avatar Customization</CardTitle>
            <CardDescription>
              Personalize the child's virtual character
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
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
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}