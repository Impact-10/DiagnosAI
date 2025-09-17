import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { AlertTriangle, Phone, MapPin, Users } from "lucide-react";

interface EmergencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmergencyDialog({ open, onOpenChange }: EmergencyDialogProps) {
  const emergencyContacts = [
    { name: "Emergency Services", number: "911", description: "Life-threatening emergencies" },
    { name: "Poison Control", number: "1-800-222-1222", description: "Poison emergencies" },
    { name: "Mental Health Crisis", number: "988", description: "Suicide & crisis lifeline" },
    { name: "Domestic Violence", number: "1-800-799-7233", description: "National domestic violence hotline" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[1.25rem] font-medium text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Emergency Contacts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-[0.875rem] font-normal">
                <p className="font-medium text-destructive mb-1">Medical Emergency</p>
                <p className="text-muted-foreground">If you're experiencing a medical emergency, call 911 immediately or go to your nearest emergency room.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <Card key={index} className="border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-[0.875rem] font-medium text-foreground">{contact.name}</h4>
                      <p className="text-[0.75rem] font-normal text-muted-foreground">{contact.description}</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-[0.875rem] font-medium"
                      onClick={() => window.open(`tel:${contact.number}`)}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      {contact.number}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-[0.875rem] font-medium text-foreground">Additional Resources</h4>
            <div className="grid gap-2">
              <Button variant="outline" size="sm" className="justify-start text-[0.875rem] font-normal">
                <MapPin className="w-4 h-4 mr-2" />
                Find Nearest Hospital
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-[0.875rem] font-normal">
                <Users className="w-4 h-4 mr-2" />
                Contact My Doctor
              </Button>
            </div>
          </div>

          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full text-[1rem] font-medium" 
            variant="outline"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}