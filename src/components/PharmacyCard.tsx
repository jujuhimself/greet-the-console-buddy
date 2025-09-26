
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

type Pharmacy = {
  id: string|number;
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  open: boolean;
  hours: string;
  phone: string;
  services: string[];
};

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  onViewStock: () => void;
}

export default function PharmacyCard({ pharmacy, onViewStock }: PharmacyCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{pharmacy.name}</CardTitle>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{pharmacy.location}</span>
            </div>
          </div>
          <Badge variant={pharmacy.open ? "default" : "secondary"}>
            {pharmacy.open ? "Open" : "Closed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="font-medium">{pharmacy.rating}</span>
              <span className="text-gray-500 text-sm ml-1">({pharmacy.reviews})</span>
            </div>
            <span className="text-sm text-gray-600">{pharmacy.distance} away</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">{pharmacy.hours}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-1" />
            <span className="text-sm">{pharmacy.phone}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {pharmacy.services.map((service, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {service}
              </Badge>
            ))}
          </div>
          <div className="pt-3 space-y-2">
            <Button className="w-full" onClick={onViewStock}>
              View Stock & Order
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
