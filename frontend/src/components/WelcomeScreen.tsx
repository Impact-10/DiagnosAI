import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Bot, Shield, Clock, AlertTriangle } from "lucide-react";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-[2rem] font-medium text-foreground mb-2 leading-[1.5]">Medical Assistant</h1>
          <p className="text-[0.875rem] font-normal text-muted-foreground leading-[1.5]">
            I'm here to help answer your health questions and provide guidance.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[0.875rem] font-normal text-foreground">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              <span>HIPAA-compliant and secure</span>
            </div>
            <div className="flex items-center gap-3 text-[0.875rem] font-normal text-foreground">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Available 24/7 for health guidance</span>
            </div>
          </div>
          
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-[0.75rem] font-normal text-warning-foreground">
                <p className="font-medium mb-1">Important Notice</p>
                <p>This chatbot does not replace professional medical advice. For emergencies, call 911 immediately.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-[0.75rem] font-normal text-muted-foreground">I can help with:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-[0.75rem] font-normal">General Health</Badge>
              <Badge variant="secondary" className="text-[0.75rem] font-normal">Symptoms</Badge>
              <Badge variant="secondary" className="text-[0.75rem] font-normal">Medications</Badge>
              <Badge variant="secondary" className="text-[0.75rem] font-normal">Wellness Tips</Badge>
            </div>
          </div>
          
          <Button onClick={onGetStarted} className="w-full bg-primary hover:bg-primary/90 text-[1rem] font-medium text-primary-foreground">
            Get Started
          </Button>
          
          <p className="text-[0.75rem] font-normal text-muted-foreground text-center">
            By continuing, you agree to our{" "}
            <button className="text-primary hover:underline font-normal">Terms of Use</button> and{" "}
            <button className="text-primary hover:underline font-normal">Privacy Policy</button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}