
import { useState, useEffect } from "react";
import { inventoryAdjustmentService, InventoryAdjustment } from "@/services/inventoryAdjustmentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ExportButton from "@/components/ExportButton";
import DateRangeFilter from "@/components/DateRangeFilter";
import UserSelect from "@/components/UserSelect";

export default function RetailAdjustment() {
  const { user } = useAuth();
  const [product_id, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState<"add" | "remove">("add");
  const [reason, setReason] = useState("");
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [filtered, setFiltered] = useState<InventoryAdjustment[]>([]);
  // filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [userId, setUserId] = useState("");
  const [adjType, setAdjType] = useState("");

  useEffect(() => {
    inventoryAdjustmentService.fetchAdjustments().then(setAdjustments);
  }, []);

  useEffect(() => {
    setFiltered(
      adjustments.filter(adj => {
        const dateOk = (!from || new Date(adj.created_at) >= new Date(from)) &&
          (!to || new Date(adj.created_at) <= new Date(to));
        const userOk = !userId || adj.user_id === userId;
        const typOk = !adjType || adj.adjustment_type === adjType;
        return dateOk && userOk && typOk;
      })
    );
  }, [adjustments, from, to, userId, adjType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !product_id || !quantity) return;

    try {
      await inventoryAdjustmentService.createAdjustment({
        user_id: user.id,
        product_id,
        adjustment_type: type,
        quantity: Number(quantity),
        reason
      });
      setProductId("");
      setQuantity("");
      setType("add");
      setReason("");
      toast({ title: "Inventory adjustment logged" });
      inventoryAdjustmentService.fetchAdjustments().then(setAdjustments);
    } catch {
      toast({ title: "Error logging adjustment", variant: "destructive" });
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Log Inventory Adjustment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              placeholder="Product ID"
              value={product_id}
              onChange={e => setProductId(e.target.value)}
              required
            />
            <select
              value={type}
              onChange={e => setType(e.target.value as "add" | "remove")}
              className="border rounded px-2 py-1"
              required
            >
              <option value="add">Add</option>
              <option value="remove">Remove</option>
            </select>
            <Input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              min="1"
              required
            />
            <Input
              placeholder="Reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
            <Button type="submit">Log Adjustment</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            Recent Adjustments
            <span className="float-right">
              <ExportButton data={filtered} filename="adjustments.csv" disabled={filtered.length === 0} />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-2 items-center">
            <DateRangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} />
            <UserSelect value={userId} onChange={setUserId} user={user} />
            <div>
              <label className="text-sm mr-1">Type:</label>
              <select className="border rounded px-2 py-1 text-sm"
                value={adjType} onChange={e => setAdjType(e.target.value)}>
                <option value="">All</option>
                <option value="add">Add</option>
                <option value="remove">Remove</option>
              </select>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div>No adjustments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Reason</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 20).map(adj => (
                    <tr key={adj.id}>
                      <td>{adj.product_id}</td>
                      <td>{adj.adjustment_type}</td>
                      <td>{adj.quantity}</td>
                      <td>{adj.reason}</td>
                      <td className="text-blue-800">{adj.user_id}</td>
                      <td>{new Date(adj.created_at).toLocaleString()}</td>
                      <td>{adj.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
