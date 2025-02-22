import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Assessment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  FileText,
  Plus,
  Activity,
  BarChart2,
  Settings,
  Users
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  const { data: assessments, isLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  // Calculate statistics
  const completedAssessments = assessments?.filter(a => a.status === "completed").length || 0;
  const pendingAssessments = assessments?.filter(a => a.status === "pending").length || 0;

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.fullName}</h1>
          <p className="text-muted-foreground">
            Manage your SEN assessments and reports
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/assessment/select-type"> {/* Changed href here */}
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-primary" />
                New Assessment
              </CardTitle>
              <CardDescription>Start a new evaluation</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/reports">
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Reports
              </CardTitle>
              <CardDescription>View detailed reports</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/progress">
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                Progress
              </CardTitle>
              <CardDescription>Track improvements</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/settings">
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary" />
                Settings
              </CardTitle>
              <CardDescription>Configure your account</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Assessments</CardTitle>
            <CardDescription>All conducted assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-primary mr-2" />
              <span className="text-3xl font-bold">
                {assessments?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <CardDescription>Finished assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-500 mr-2" />
              <span className="text-3xl font-bold">{completedAssessments}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription>In-progress assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-yellow-500 mr-2" />
              <span className="text-3xl font-bold">{pendingAssessments}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
          <CardDescription>View and manage your assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading assessments...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Child Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments?.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>{assessment.childName}</TableCell>
                    <TableCell>{assessment.childAge} years</TableCell>
                    <TableCell>
                      {format(new Date(assessment.dateCreated), "PP")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          assessment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {assessment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/assessment/${assessment.id}`}>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          View
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