
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

type PharmacyStock = {
  name: string;
  price: number;
  available: boolean;
};

interface PharmacyStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pharmacyName?: string;
  stock?: PharmacyStock[];
  onOrder: (medicine: string) => void;
}

export default function PharmacyStockDialog({
  open,
  onOpenChange,
  pharmacyName,
  stock,
  onOrder,
}: PharmacyStockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{pharmacyName} - Available Stock</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {stock?.length ? (
            stock.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-gray-600">TZS {item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={item.available ? "default" : "secondary"}>
                    {item.available ? "In Stock" : "Out of Stock"}
                  </Badge>
                  {item.available && (
                    <Button
                      size="sm"
                      onClick={() => onOrder(item.name)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Order
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No stock details available.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
