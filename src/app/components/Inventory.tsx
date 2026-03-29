import { useEffect, useState } from "react";
import { Package, AlertTriangle, Plus, TrendingUp, Loader2 } from "lucide-react";
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
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { apiService } from "../../lib/api";
import { InventoryItem } from "../types";
import { motion } from "motion/react";
import { useRole } from "../context/RoleContext";
import { Navigate } from "react-router-dom";

export function Inventory() {
  const { role } = useRole();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Supplies",
    quantity: "0",
    minStock: "10",
    unit: "pcs"
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInventory();
      setInventory(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async () => {
    try {
      setLoading(true);
      const payload = {
        name: newItem.name,
        category: newItem.category,
        unit: newItem.unit,
        quantity: parseInt(newItem.quantity) || 0,
        min_stock: parseInt(newItem.minStock) || 0,
        last_restocked: new Date().toISOString()
      };
      await apiService.createInventoryItem(payload);
      setShowAddDialog(false);
      setNewItem({ name: "", category: "Supplies", quantity: "0", minStock: "10", unit: "pcs" });
      fetchInventory();
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = inventory.filter(
    (item) => item.quantity < item.minStock
  );
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const getStockStatus = (quantity: number, minStock: number) => {
    const percentage = (quantity / minStock) * 100;
    if (percentage < 50) return { label: "Critical", color: "bg-red-100 text-red-700" };
    if (percentage < 100) return { label: "Low", color: "bg-orange-100 text-orange-700" };
    return { label: "Good", color: "bg-green-100 text-green-700" };
  };

  const getProgressColor = (quantity: number, minStock: number) => {
    const percentage = (quantity / minStock) * 100;
    if (percentage < 50) return "bg-red-500";
    if (percentage < 100) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage supplies and track stock levels
          </p>
        </div>
        <Button 
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
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
                Total Items
              </CardTitle>
              <Package className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{totalItems}</div>
              <p className="text-xs text-gray-500 mt-1">In stock</p>
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
                Low Stock Items
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                {lowStockItems.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Need restocking</p>
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
                Categories
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                {new Set(inventory.map((item) => item.category)).size}
              </div>
              <p className="text-xs text-gray-500 mt-1">Product categories</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-lg text-orange-900">
                Low Stock Alert
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-800">
              {lowStockItems.length} items are running low and need to be restocked soon.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {lowStockItems.map((item) => (
                <Badge
                  key={item._id || item.id}
                  variant="outline"
                  className="bg-white border-orange-200"
                >
                  {item.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">All Items ({inventory.length})</CardTitle>
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
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Restocked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item, index) => {
                    const status = getStockStatus(item.quantity, item.minStock);
                    const percentage = Math.min(
                      (item.quantity / item.minStock) * 100,
                      100
                    );

                    return (
                      <motion.tr
                        key={item._id || item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-gray-600">{item.category}</TableCell>
                        <TableCell className="text-gray-900 font-medium">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getProgressColor(
                                  item.quantity,
                                  item.minStock
                                )} transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500">
                              Min: {item.minStock} {item.unit}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color} variant="secondary">
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          }) : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Restock
                          </Button>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Items by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from(new Set(inventory.map((item) => item.category))).map(
              (category) => {
                const categoryItems = inventory.filter(
                  (item) => item.category === category
                );
                const totalQty = categoryItems.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                );

                return (
                  <Card key={category} className="border-gray-200">
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-600">{category}</div>
                      <div className="text-2xl font-semibold text-gray-900 mt-1">
                        {categoryItems.length}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {totalQty} total items
                      </div>
                    </CardContent>
                  </Card>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>
      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input 
                placeholder="Gloves, Masks, etc."
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={newItem.category}
                onValueChange={(v) => setNewItem({...newItem, category: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supplies">Supplies</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Medication">Medication</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input 
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Stock Level</Label>
                <Input 
                  type="number"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({...newItem, minStock: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Unit (e.g., pcs, boxes)</Label>
              <Input 
                placeholder="pcs"
                value={newItem.unit}
                onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
              />
            </div>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 mt-2" 
              onClick={handleAddItem}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add to Inventory"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
