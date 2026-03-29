import { useEffect, useState } from "react";
import { Plus, DollarSign, FileText, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { apiService } from "../../lib/api";
import { Invoice, Patient } from "../types";
import { motion } from "motion/react";

export function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoiceRes, patientRes] = await Promise.all([
          apiService.getInvoices(),
          apiService.getPatients(),
        ]);
        setInvoices(invoiceRes.data);
        setPatients(patientRes.data);
      } catch (error) {
        console.error("Error fetching billing data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { className: string; label: string }> = {
      paid: { className: "bg-green-100 text-green-700", label: "Paid" },
      unpaid: { className: "bg-red-100 text-red-700", label: "Unpaid" },
      partial: { className: "bg-orange-100 text-orange-700", label: "Partial" },
    };
    const config = configs[status] || configs.unpaid;
    return (
      <Badge className={config.className} variant="secondary">
        {config.label}
      </Badge>
    );
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalPending = invoices
    .filter((inv) => inv.status === "unpaid" || inv.status === "partial")
    .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Revenue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor auto-generated invoices and payments
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <DollarSign className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">All time collected</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Payments
              </CardTitle>
              <FileText className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                ₹{totalPending.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Outstanding balance</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Invoices
              </CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                {invoices.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Invoices created</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Invoices Table */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice, index) => (
                    <motion.tr
                      key={invoice._id || invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">
                        {invoice.id}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {invoice.patientName}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(invoice.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-gray-900 font-medium">
                        ₹{invoice.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        ₹{(invoice.paidAmount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}