import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertTriangle, ThermometerSun, Heart, Brain, Stethoscope } from "lucide-react";

interface SymptomCheckerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (symptoms: string[], urgency: string) => void;
}

const symptomCategories = [
  {
    category: "General",
    icon: <Stethoscope className="w-4 h-4" />,
    symptoms: ["Fatigue", "Fever", "Headache", "Nausea", "Dizziness"]
  },
  {
    category: "Respiratory",
    icon: <ThermometerSun className="w-4 h-4" />,
    symptoms: ["Cough", "Shortness of breath", "Sore throat", "Chest pain"]
  },
  {
    category: "Cardiovascular",
    icon: <Heart className="w-4 h-4" />,
    symptoms: ["Chest pain", "Rapid heartbeat", "Swelling", "High blood pressure"]
  },
  {
    category: "Neurological",
    icon: <Brain className="w-4 h-4" />,
    symptoms: ["Memory issues", "Confusion", "Numbness", "Vision changes"]
  }
];

export function SymptomChecker({ open, onOpenChange, onComplete }: SymptomCheckerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleNext = () => {
    if (selectedSymptoms.length > 0) {
      setStep(2);
    }
  };

  const handleComplete = (urgency: string) => {
    onComplete(selectedSymptoms, urgency);
    setSelectedSymptoms([]);
    setStep(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[1.25rem] font-medium text-foreground">
            <Stethoscope className="w-5 h-5 text-primary" />
            Symptom Checker
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-[0.875rem] font-normal">
                  <p className="font-medium mb-1 text-warning-foreground">For Emergency Situations</p>
                  <p className="text-muted-foreground">If you're experiencing severe symptoms or a medical emergency, please call 911 immediately.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[1.125rem] font-medium mb-3 text-foreground">Select your symptoms:</h3>
              <div className="grid gap-4">
                {symptomCategories.map((category) => (
                  <Card key={category.category}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-primary">{category.icon}</div>
                        <h4 className="text-[1rem] font-medium text-foreground">{category.category}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {category.symptoms.map((symptom) => (
                          <div key={symptom} className="flex items-center space-x-2">
                            <Checkbox
                              id={symptom}
                              checked={selectedSymptoms.includes(symptom)}
                              onCheckedChange={() => handleSymptomToggle(symptom)}
                            />
                            <label htmlFor={symptom} className="text-[0.875rem] font-normal cursor-pointer text-foreground">
                              {symptom}
                            </label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {selectedSymptoms.length > 0 && (
              <div>
                <h4 className="text-[0.875rem] font-medium mb-2 text-foreground">Selected symptoms:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((symptom) => (
                    <Badge key={symptom} variant="secondary" className="text-[0.75rem] font-normal">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-[1.125rem] font-medium text-foreground">How urgent are your symptoms?</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full text-left justify-start h-auto p-4 border-destructive/20 hover:bg-destructive/5"
                onClick={() => handleComplete("urgent")}
              >
                <div>
                  <div className="text-[1rem] font-medium text-destructive">Urgent - Severe symptoms</div>
                  <div className="text-[0.875rem] font-normal text-muted-foreground">Symptoms are severe and affecting daily activities</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full text-left justify-start h-auto p-4 border-warning/20 hover:bg-warning/5"
                onClick={() => handleComplete("moderate")}
              >
                <div>
                  <div className="text-[1rem] font-medium text-warning">Moderate - Concerning symptoms</div>
                  <div className="text-[0.875rem] font-normal text-muted-foreground">Symptoms are noticeable but manageable</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full text-left justify-start h-auto p-4 border-success/20 hover:bg-success/5"
                onClick={() => handleComplete("mild")}
              >
                <div>
                  <div className="text-[1rem] font-medium text-success">Mild - Minor symptoms</div>
                  <div className="text-[0.875rem] font-normal text-muted-foreground">Symptoms are mild and not interfering with daily life</div>
                </div>
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <Button 
              onClick={handleNext} 
              disabled={selectedSymptoms.length === 0}
              className="bg-primary hover:bg-primary/90 text-[1rem] font-medium text-primary-foreground"
            >
              Next
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setStep(1)} className="text-[1rem] font-medium">
              Back
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}