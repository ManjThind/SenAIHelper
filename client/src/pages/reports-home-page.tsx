import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, FileText, AlertCircle } from "lucide-react";
import { Report } from "@shared/schema";

export default function ReportsHomePage() {
  const [, navigate] = useLocation();

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

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
          <h1 className="text-3xl font-bold">Assessment Reports</h1>
          <p className="text-muted-foreground">
            View and manage all assessment reports
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>
            Comprehensive list of all generated assessment reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading reports...</div>
          ) : !reports?.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No reports found</p>
              <p className="text-sm text-muted-foreground">
                Complete an assessment to generate a report
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Generated</TableHead>
                  <TableHead>Child ID</TableHead>
                  <TableHead>Assessment ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Follow-up Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {format(new Date(report.dateGenerated), "PP")}
                    </TableCell>
                    <TableCell>{report.childId}</TableCell>
                    <TableCell>{report.assessmentId}</TableCell>
                    <TableCell className="capitalize">{report.status}</TableCell>
                    <TableCell>
                      {report.followUpDate
                        ? format(new Date(report.followUpDate), "PP")
                        : "Not scheduled"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/report/${report.assessmentId}`)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
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
