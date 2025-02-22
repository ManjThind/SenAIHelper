import { useQuery } from "@tanstack/react-query";
import { Child } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AvatarPreview } from "@/components/ui/avatar-preview";
import { format } from "date-fns";
import { Plus, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ChildrenListPage() {
  const { data: children, isLoading } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  function calculateAge(dateOfBirth: Date) {
    return Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Children Profiles</h1>
          <p className="text-muted-foreground">
            View and manage all registered children
          </p>
        </div>
        <Link href="/child/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Child
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Children</CardTitle>
          <CardDescription>
            A list of all registered children and their basic information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading children profiles...</div>
          ) : !children?.length ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No children profiles found</p>
              <Link href="/child/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Profile
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell>
                      <AvatarPreview config={child.avatar} size="sm" animate={false} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {child.firstName} {child.lastName}
                    </TableCell>
                    <TableCell>{calculateAge(child.dateOfBirth)} years</TableCell>
                    <TableCell className="capitalize">{child.gender}</TableCell>
                    <TableCell>{format(new Date(child.createdAt), "PP")}</TableCell>
                    <TableCell>
                      <Link href={`/child/${child.id}`}>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
