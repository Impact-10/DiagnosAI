import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Stethoscope,
  Building2,
  Pill
} from "lucide-react";
import { diagnosisService } from "@/services/diagnosisService";

interface Facility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy';
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  distance?: number;
  isOpen?: boolean;
  hours?: string;
  services?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface ClinicFinderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const facilityTypeLabels = {
  'hospital': 'Hospital',
  'clinic': 'Clinic',
  'pharmacy': 'Pharmacy'
};

const facilityTypeIcons = {
  'hospital': Building2,
  'clinic': Stethoscope,
  'pharmacy': Pill
};

// Mock data for demonstration
const mockFacilities: Facility[] = [
  {
    id: '1',
    name: 'City General Hospital',
    type: 'hospital',
    address: '123 Main St, Downtown, NY 10001',
    phone: '+1 (555) 123-4567',
    website: 'https://citygeneralhospital.com',
    rating: 4.5,
    distance: 0.8,
    isOpen: true,
    hours: 'Open 24/7',
    services: ['Emergency Care', 'Surgery', 'ICU', 'Cardiology'],
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: '2',
    name: 'Downtown Medical Clinic',
    type: 'clinic',
    address: '456 Health Ave, Downtown, NY 10002',
    phone: '+1 (555) 234-5678',
    rating: 4.2,
    distance: 1.2,
    isOpen: true,
    hours: 'Mon-Fri 8AM-6PM',
    services: ['General Practice', 'Vaccinations', 'Check-ups'],
    coordinates: { lat: 40.7589, lng: -73.9851 }
  },
  {
    id: '3',
    name: 'HealthPlus Pharmacy',
    type: 'pharmacy',
    address: '789 Wellness Blvd, Midtown, NY 10003',
    phone: '+1 (555) 345-6789',
    rating: 4.0,
    distance: 0.5,
    isOpen: false,
    hours: 'Mon-Sat 9AM-9PM',
    services: ['Prescriptions', 'Vaccinations', 'Health Screenings'],
    coordinates: { lat: 40.7505, lng: -73.9934 }
  },
  {
    id: '4',
    name: 'Emergency Medical Center',
    type: 'hospital',
    address: '321 Urgent Care Dr, Uptown, NY 10004',
    phone: '+1 (555) 456-7890',
    rating: 4.7,
    distance: 2.1,
    isOpen: true,
    hours: 'Open 24/7',
    services: ['Emergency Care', 'X-Ray', 'Lab Tests'],
    coordinates: { lat: 40.7831, lng: -73.9712 }
  },
  {
    id: '5',
    name: 'Family Health Clinic',
    type: 'clinic',
    address: '654 Care Lane, Suburbia, NY 10005',
    phone: '+1 (555) 567-8901',
    rating: 4.3,
    distance: 3.2,
    isOpen: true,
    hours: 'Mon-Fri 7AM-7PM, Sat 9AM-5PM',
    services: ['Family Medicine', 'Pediatrics', 'Women\'s Health'],
    coordinates: { lat: 40.7282, lng: -73.7949 }
  }
];

export function ClinicFinder({ open, onOpenChange }: ClinicFinderProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    if (open) {
      requestLocation();
      loadMockData(); // In a real app, this would call the API
    }
  }, [open]);

  useEffect(() => {
    filterFacilities();
  }, [facilities, searchQuery, selectedType]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationPermission('granted');
      },
      (error) => {
        setLocationPermission('denied');
        setError("Location access denied. Using default location.");
        // Use a default location (e.g., New York City)
        setUserLocation({ lat: 40.7128, lng: -74.0060 });
      }
    );
  };

  const loadMockData = () => {
    // In a real implementation, this would call diagnosisService.getNearbyFacilities
    setLoading(true);
    setTimeout(() => {
      setFacilities(mockFacilities);
      setLoading(false);
    }, 1000);
  };

  const filterFacilities = () => {
    let filtered = facilities;
    
    if (searchQuery) {
      filtered = filtered.filter(facility => 
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.services?.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    if (selectedType !== "all") {
      filtered = filtered.filter(facility => facility.type === selectedType);
    }
    
    // Sort by distance
    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    setFilteredFacilities(filtered);
  };

  const handleDirections = (facility: Facility) => {
    if (!facility.coordinates) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.lat},${facility.coordinates.lng}`;
    window.open(url, '_blank');
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
            ? 'fill-warning text-warning'
            : 'text-muted-foreground'
        }`}
      />
    ));
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

        {locationPermission === 'denied' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enable location access for more accurate results, or search by address.
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
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="hospital" className="text-xs">Hospitals</TabsTrigger>
                  <TabsTrigger value="clinic" className="text-xs">Clinics</TabsTrigger>
                  <TabsTrigger value="pharmacy" className="text-xs">Pharmacies</TabsTrigger>
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
            <ScrollArea className="h-full">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Facilities Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or check your location settings.
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
                                  <Badge variant="secondary" className="text-[0.75rem]">
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
                                      {facility.distance} mi away
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <Badge variant={facility.isOpen ? "secondary" : "destructive"} className="text-[0.75rem]">
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
                                  {facility.services.slice(0, 3).map((service, index) => (
                                    <Badge key={index} variant="outline" className="text-[0.7rem]">
                                      {service}
                                    </Badge>
                                  ))}
                                  {facility.services.length > 3 && (
                                    <Badge variant="outline" className="text-[0.7rem]">
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
                                  onClick={() => window.open(facility.website, '_blank')}
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
            </ScrollArea>
          </TabsContent>

          <TabsContent value="map" className="flex-1">
            <div className="h-full bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Map View</h3>
                <p className="text-muted-foreground mb-4">
                  Interactive map would be integrated here using Google Maps or similar service.
                </p>
                <Button onClick={() => window.open('https://maps.google.com', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}