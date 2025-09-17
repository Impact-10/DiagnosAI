import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Edit3, Save, X, Phone, Mail, Calendar, Heart, AlertCircle, Loader2, Plus } from "lucide-react";
import { authService, User as UserType } from "../../services/authService";

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfile({ open, onOpenChange }: UserProfileProps) {
  const [user, setUser] = useState<UserType | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<Partial<UserType>>({});

  useEffect(() => {
    if (open) {
      loadUserProfile();
    }
  }, [open]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setFormData(currentUser);
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      
      const updatedUser = await authService.updateProfile(formData);
      setUser(updatedUser);
      setEditMode(false);
      setSuccess("Profile updated successfully!");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(user || {});
    setEditMode(false);
    setError("");
  };

  const addAllergy = () => {
    const newAllergy = prompt("Enter new allergy:");
    if (newAllergy) {
      setFormData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), newAllergy]
      }));
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies?.filter((_, i) => i !== index) || []
    }));
  };

  const addMedication = () => {
    const newMedication = prompt("Enter current medication:");
    if (newMedication) {
      setFormData(prev => ({
        ...prev,
        medications: [...(prev.medications || []), newMedication]
      }));
    }
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications?.filter((_, i) => i !== index) || []
    }));
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[1.25rem] font-medium text-foreground">
            <User className="w-5 h-5 text-primary" />
            User Profile
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-success text-success">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="medical">Medical Info</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="" alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="text-lg">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-[1.125rem] font-medium">{user.firstName} {user.lastName}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant={editMode ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    disabled={loading}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    {editMode ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    {editMode ? (
                      <Input
                        value={formData.firstName || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={loading}
                      />
                    ) : (
                      <p className="text-[0.875rem] py-2">{user.firstName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    {editMode ? (
                      <Input
                        value={formData.lastName || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={loading}
                      />
                    ) : (
                      <p className="text-[0.875rem] py-2">{user.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-[0.875rem] py-2 text-muted-foreground">{user.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    {editMode ? (
                      <Input
                        type="date"
                        value={formData.dateOfBirth || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={loading}
                      />
                    ) : (
                      <p className="text-[0.875rem] py-2">{user.dateOfBirth || "Not provided"}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    {editMode ? (
                      <Select
                        value={formData.gender || ""}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-[0.875rem] py-2">{user.gender || "Not provided"}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Phone</Label>
                  {editMode ? (
                    <Input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-[0.875rem] py-2">{user.phone || "Not provided"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <h4 className="text-[1rem] font-medium">Medical History</h4>
                </CardHeader>
                <CardContent>
                  {editMode ? (
                    <Textarea
                      placeholder="Enter medical history, chronic conditions, past surgeries, etc."
                      value={formData.medicalHistory?.join(', ') || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        medicalHistory: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                      disabled={loading}
                      className="min-h-[80px]"
                    />
                  ) : (
                    <p className="text-[0.875rem]">
                      {user.medicalHistory?.join(', ') || "No medical history recorded"}
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[1rem] font-medium">Allergies</h4>
                    {editMode && (
                      <Button size="sm" variant="outline" onClick={addAllergy}>
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(editMode ? formData.allergies : user.allergies)?.map((allergy, index) => (
                      <Badge key={index} variant="secondary" className="relative">
                        {allergy}
                        {editMode && (
                          <button
                            onClick={() => removeAllergy(index)}
                            className="ml-2 text-destructive hover:text-destructive/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    )) || <p className="text-[0.875rem] text-muted-foreground">No allergies recorded</p>}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[1rem] font-medium">Current Medications</h4>
                    {editMode && (
                      <Button size="sm" variant="outline" onClick={addMedication}>
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(editMode ? formData.medications : user.medications)?.map((medication, index) => (
                      <Badge key={index} variant="secondary" className="relative">
                        {medication}
                        {editMode && (
                          <button
                            onClick={() => removeMedication(index)}
                            className="ml-2 text-destructive hover:text-destructive/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    )) || <p className="text-[0.875rem] text-muted-foreground">No medications recorded</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <h4 className="text-[1rem] font-medium">Emergency Contact</h4>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  {editMode ? (
                    <Input
                      value={formData.emergencyContact?.name || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact!, name: e.target.value }
                      }))}
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-[0.875rem] py-2">{user.emergencyContact?.name || "Not provided"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  {editMode ? (
                    <Input
                      type="tel"
                      value={formData.emergencyContact?.phone || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact!, phone: e.target.value }
                      }))}
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-[0.875rem] py-2">{user.emergencyContact?.phone || "Not provided"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  {editMode ? (
                    <Input
                      value={formData.emergencyContact?.relationship || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact!, relationship: e.target.value }
                      }))}
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-[0.875rem] py-2">{user.emergencyContact?.relationship || "Not provided"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {editMode && (
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}