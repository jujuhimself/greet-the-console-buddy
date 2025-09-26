
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock, Phone, Navigation } from "lucide-react";

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  distance: string;
  isOpen: boolean;
  operatingHours: string;
  services: string[];
}

const PharmacyFinder = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [pharmacies] = useState<Pharmacy[]>([
    {
      id: "1",
      name: "City Pharmacy",
      address: "Kisutu Street, Dar es Salaam",
      phone: "+255 22 211 3456",
      rating: 4.8,
      distance: "0.5 km",
      isOpen: true,
      operatingHours: "8:00 AM - 10:00 PM",
      services: ["Prescription", "OTC Medicines", "Consultation", "Delivery"]
    },
    {
      id: "2",
      name: "HealthCare Plus Pharmacy",
      address: "Samora Avenue, Dar es Salaam",
      phone: "+255 22 266 7890",
      rating: 4.6,
      distance: "1.2 km",
      isOpen: true,
      operatingHours: "7:00 AM - 9:00 PM",
      services: ["Prescription", "OTC Medicines", "Medical Equipment"]
    },
    {
      id: "3",
      name: "MediPoint Pharmacy",
      address: "Uhuru Street, Dar es Salaam",
      phone: "+255 22 212 4567",
      rating: 4.7,
      distance: "2.1 km",
      isOpen: false,
      operatingHours: "9:00 AM - 8:00 PM",
      services: ["Prescription", "OTC Medicines", "Health Checkup"]
    },
    {
      id: "4",
      name: "Wellness Pharmacy",
      address: "Posta Street, Dar es Salaam",
      phone: "+255 22 218 9012",
      rating: 4.5,
      distance: "3.0 km",
      isOpen: true,
      operatingHours: "8:30 AM - 9:30 PM",
      services: ["Prescription", "OTC Medicines", "Consultation", "Lab Tests"]
    }
  ]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setSearchLocation("Current Location");
        },
        () => {
          alert("Unable to get your location. Please enter manually.");
        }
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Find Nearby Pharmacies
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter your location or area"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="flex-1"
          />
          <Button 
            variant="outline" 
            onClick={handleGetCurrentLocation}
            className="shrink-0"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Use Current
          </Button>
        </div>

        {/* Pharmacy List */}
        <div className="space-y-4">
          {pharmacies.map((pharmacy) => (
            <Card key={pharmacy.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{pharmacy.name}</h3>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {pharmacy.address}
                    </p>
                    <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {pharmacy.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{pharmacy.rating}</span>
                    </div>
                    <p className="text-sm text-gray-500">{pharmacy.distance}</p>
                  </div>
                </div>

                {/* Operating Hours & Status */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={pharmacy.isOpen ? "default" : "secondary"}>
                    <Clock className="h-3 w-3 mr-1" />
                    {pharmacy.isOpen ? "Open" : "Closed"}
                  </Badge>
                  <span className="text-sm text-gray-600">{pharmacy.operatingHours}</span>
                </div>

                {/* Services */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Services:</p>
                  <div className="flex flex-wrap gap-1">
                    {pharmacy.services.map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    View Products
                  </Button>
                  <Button size="sm" variant="outline">
                    Call
                  </Button>
                  <Button size="sm" variant="outline">
                    Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyFinder;
