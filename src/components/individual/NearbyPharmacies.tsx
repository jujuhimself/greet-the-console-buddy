import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Star } from "lucide-react";

interface Pharmacy {
  id: string | number;
  name: string;
  location: string;
  phone: string;
  rating: number;
  distance: string;
  open: boolean;
  hours: string;
}

const NearbyPharmacies = ({ pharmacies }: { pharmacies: Pharmacy[] }) => (
  <Card className="shadow-lg border-0">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="text-2xl">Nearby Pharmacies</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/pharmacy-directory">View All</Link>
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {pharmacies.map((pharmacy) => (
          <div key={pharmacy.id} className="flex justify-between items-center p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-semibold text-lg">{pharmacy.name}</p>
              <p className="text-gray-600 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {pharmacy.location}
              </p>
              {pharmacy.phone && pharmacy.phone !== 'N/A' && (
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <Phone className="h-4 w-4" />
                  {pharmacy.phone}
                </p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{pharmacy.rating}</span>
                <Badge variant={pharmacy.open ? "default" : "secondary"}>
                  {pharmacy.open ? "Open" : "Closed"}
                </Badge>
                <Clock className="h-4 w-4 ml-2" />
                <span className="text-sm text-gray-600">{pharmacy.hours}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/pharmacy-directory">View Store</Link>
            </Button>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default NearbyPharmacies;
