// src/components/ClinicFinder.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  Search,
  Map,
  Filter,
  AlertCircle,
  Loader2,
  ExternalLink,
  Building2,
  Stethoscope,
  Pill,
} from "lucide-react";
import diagnosisService, { Facility } from "@/services/diagnosisService";
import { MapView } from "@/components/MapView";

interface ClinicFinderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClinicFinder({ open, onOpenChange }: ClinicFinderProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");

  const diagnosis = "fever";
  const preferences = { urgency: "normal" as const };

  useEffect(() => {
    if (open) {
      requestLocation();
    }
  }, [open]);

  useEffect(() => {
    if (userLocation) {
      fetchFacilities();
    }
  }, [userLocation]);

  useEffect(() => {
    filterFacilities();
  }, [facilities, searchQuery, selectedType]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setUserLocation({ lat: 40.7128, lng: -74.006 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationPermission("granted");
      },
      () => {
        setLocationPermission("denied");
        setError("Location access denied. Using default location.");
        setUserLocation({ lat: 40.7128, lng: -74.006 });
      }
    );
  };

  const fetchFacilities = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await diagnosisService.getNearbyFacilities({
        location: userLocation!, // Pass as object with lat and lng
        diagnosis,
        preferences,
      });
      setFacilities(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load facilities");
    } finally {
      setLoading(false);
    }
  };

  const filterFacilities = () => {
    let filtered = facilities;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q) ||
          f.services?.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (selectedType !== "all") {
      filtered = filtered.filter((f) => f.type === selectedType);
    }
    filtered.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    setFilteredFacilities(filtered);
  };

  const handleDirections = (facility: Facility) => {
    if (!facility.coordinates) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.lat},${facility.coordinates.lng}`;
    window.open(url, "_blank");
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating)
            ? "fill-warning text-warning"
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  const facilityTypeLabels = {
    hospital: "Hospital",
    clinic: "Clinic",
    pharmacy: "Pharmacy",
  };

  const facilityTypeIcons = {
    hospital: Building2,
    clinic: Stethoscope,
    pharmacy: Pill,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[1.25rem] font-medium text-foreground">
            <MapPin className="w-5 h-5 text-primary" />
            Find Nearby Medical Facilities
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {locationPermission === "denied" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enable location access for more accurate results, or search by
              address.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="list" className="flex flex-col flex-1">
          <div className="flex flex-col sm:flex-row gap-3 pb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search facilities or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Tabs defaultValue="all" onValueChange={setSelectedType}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="hospital" className="text-xs">
                    Hospitals
                  </TabsTrigger>
                  <TabsTrigger value="clinic" className="text-xs">
                    Clinics
                  </TabsTrigger>
                  <TabsTrigger value="pharmacy" className="text-xs">
                    Pharmacies
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <TabsList className="w-full">
            <TabsTrigger value="list" className="flex-1">
              <Filter className="w-4 h-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex-1">
              <Map className="w-4 h-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="flex-1">
            <div className="h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No Facilities Found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or check your location
                    settings.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pb-4">
                  {filteredFacilities.map((facility) => {
                    const IconComponent = facilityTypeIcons[facility.type];
                    return (
                      <Card key={facility.id} className="p-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h4 className="text-[1rem] font-medium text-foreground">
                                  {facility.name}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-[0.75rem]"
                                  >
                                    {facilityTypeLabels[facility.type]}
                                  </Badge>
                                  {facility.rating && (
                                    <div className="flex items-center gap-1">
                                      {renderStars(facility.rating)}
                                      <span className="text-[0.75rem] text-muted-foreground ml-1">
                                        {facility.rating}
                                      </span>
                                    </div>
                                  )}
                                  {facility.distance && (
                                    <span className="text-[0.75rem] text-muted-foreground">
                                      {facility.distance} km away
                                    </span>
                                  )}
                                </div>
                              </div>

                              <Badge
                                variant={
                                  facility.isOpen ? "secondary" : "destructive"
                                }
                                className="text-[0.75rem]"
                              >
                                {facility.isOpen ? "Open" : "Closed"}
                              </Badge>
                            </div>

                            <div className="space-y-2 text-[0.875rem] text-muted-foreground">
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{facility.address}</span>
                              </div>

                              {facility.hours && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 flex-shrink-0" />
                                  <span>{facility.hours}</span>
                                </div>
                              )}

                              {facility.services && facility.services.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {facility.services
                                    .slice(0, 3)
                                    .map((service, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-[0.7rem]"
                                      >
                                        {service}
                                      </Badge>
                                    ))}
                                  {facility.services.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-[0.7rem]"
                                    >
                                      +{facility.services.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDirections(facility)}
                                className="flex-1 text-[0.875rem]"
                              >
                                <Navigation className="w-3 h-3 mr-1" />
                                Directions
                              </Button>

                              {facility.phone && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCall(facility.phone!)}
                                  className="flex-1 text-[0.875rem]"
                                >
                                  <Phone className="w-3 h-3 mr-1" />
                                  Call
                                </Button>
                              )}

                              {facility.website && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    window.open(facility.website, "_blank")
                                  }
                                  className="flex-1 text-[0.875rem]"
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Website
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="map" className="flex-1 min-h-[400px]">
            {userLocation ? (
              <div className="h-full w-full">
                <MapView
                  center={userLocation}
                  facilities={filteredFacilities
                    .filter((facility) => facility.coordinates && facility.coordinates.lat && facility.coordinates.lng)
                    .map((facility) => ({
                      id: facility.id,
                      name: facility.name,
                      type: facility.type,
                      coordinates: facility.coordinates!,
                    }))}
                />
              </div>
            ) : (
              <div className="h-full bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Enable location for map view, or search to see results
                    here.
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Allow location access or perform a search to see medical
                    facilities here.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
