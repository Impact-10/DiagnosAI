import { useState, useRef, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { Badge } from "./components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ChatBubble } from "./components/ChatBubble";
import { ChatInput } from "./components/ChatInput";
import { QuickReplies } from "./components/QuickReplies";
import { SymptomChecker } from "./components/SymptomChecker";
import { EmergencyDialog } from "./components/EmergencyDialog";
import { ImageUpload } from "./components/ImageUpload";
import { HealthRecords } from "./components/HealthRecords";
import { ClinicFinder } from "./components/ClinicFinder";
import { LoginDialog } from "./components/auth/LoginDialog";
import { UserProfile } from "./components/auth/UserProfile";
import { ReportPage } from "./components/ReportPage";
import { MapView } from "./components/MapView";
import { authService } from "./services/authService";
import { diagnosisService } from "./services/diagnosisService";
import { Facility } from "./services/diagnosisService";
import 'leaflet/dist/leaflet.css';
import { Bot, AlertTriangle, Stethoscope, Phone, MoreVertical, Moon, Sun, Camera, FileText, MapPin, User, LogIn, LogOut } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
}

const initialQuickReplies = [
  "I have a headache",
  "Check my symptoms",
  "Medication questions",
  "General health tips"
];

const mockBotResponses = {
  "I have a headache": "I understand you're experiencing a headache. Headaches can have various causes including stress, dehydration, or tension. Can you tell me more about when it started and how severe it is on a scale of 1-10?",
  "Check my symptoms": "I'd be happy to help you assess your symptoms. Let me open the symptom checker for you.",
  "Medication questions": "I can help with general medication information. Please note that I cannot provide specific medical advice about your prescriptions. What would you like to know?",
  "General health tips": "Here are some general wellness tips: Stay hydrated, get 7-9 hours of sleep, eat a balanced diet, exercise regularly, and manage stress. Is there a specific area of health you'd like to focus on?"
};

export default function App() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showHealthRecords, setShowHealthRecords] = useState(false);
  const [showClinicFinder, setShowClinicFinder] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Initialize authentication state
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      const user = authService.getCurrentUser();
      setIsAuthenticated(isAuth);
      setCurrentUser(user);
    };
    
    checkAuth();
  }, []);

  const addMessage = (content: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isBot,
      timestamp: formatTimestamp()
    };
    setMessages((prev: Message[]) => [...prev, newMessage]);
  };

  const simulateBotResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      // Check for specific actions
      if (userMessage.toLowerCase().includes("symptom") || userMessage === "Check my symptoms") {
        setShowSymptomChecker(true);
        setIsTyping(false);
        return;
      }
      
      if (userMessage.toLowerCase().includes("find") && userMessage.toLowerCase().includes("clinic")) {
        setShowClinicFinder(true);
        setIsTyping(false);
        return;
      }
      
      // For authenticated users, use real AI diagnosis
      if (isAuthenticated) {
        try {
          const diagnosisResponse = await diagnosisService.getDiagnosis({
            symptoms: userMessage,
            health_records: currentUser?.medicalHistory || undefined
          });
          
          setTimeout(() => {
            setIsTyping(false);
            addMessage(diagnosisResponse.diagnosis, true);
            
            // Set contextual quick replies based on AI response
            if (diagnosisResponse.urgency === 'emergency') {
              setQuickReplies(["Call 911", "Find emergency room", "Emergency contact"]);
            } else if (diagnosisResponse.urgency === 'high') {
              setQuickReplies(["Find nearby clinic", "Book appointment", "More symptoms"]);
            } else {
              setQuickReplies(["Prevention tips", "Find nearby clinic", "More questions", "Upload images"]);
            }
          }, 1500);
          return;
        } catch (error) {
          console.error('AI diagnosis failed:', error);
          // Fall back to mock responses
        }
      }
      
      // Fallback to mock responses
      setTimeout(() => {
        setIsTyping(false);
        
        const response = mockBotResponses[userMessage as keyof typeof mockBotResponses] || 
          "Thank you for your message. I'm here to help with your health questions. For more personalized assistance, please sign in or provide more details about what you're experiencing.";
        
        addMessage(response, true);
        
        // Update quick replies based on context
        if (userMessage.toLowerCase().includes("headache")) {
          setQuickReplies(["Rate pain 1-10", "How long?", "Any other symptoms?", "Emergency help"]);
        } else if (!isAuthenticated) {
          setQuickReplies(["Sign in", "Emergency contact", "Find clinic", "General tips"]);
        } else {
          setQuickReplies(["Tell me more", "Upload images", "Find clinic", "Prevention tips"]);
        }
      }, 1500);
    } catch (error) {
      setIsTyping(false);
      addMessage("I'm sorry, I'm having trouble processing your request right now. Please try again.", true);
    }
  };

  const handleSendMessage = (message: string) => {
    addMessage(message, false);
    setQuickReplies([]);
    simulateBotResponse(message);
  };

  const handleQuickReply = (reply: string) => {
    if (reply === "Emergency contact" || reply === "Emergency help" || reply === "Call 911") {
      setShowEmergencyDialog(true);
      return;
    }
    
    if (reply === "Find clinic" || reply === "Find nearby clinic" || reply === "Find emergency room") {
      setShowClinicFinder(true);
      return;
    }
    
    if (reply === "Upload images") {
      setShowImageUpload(true);
      return;
    }
    
    if (reply === "Sign in") {
      setShowLoginDialog(true);
      return;
    }
    
    handleSendMessage(reply);
  };

  const handleImageUpload = async (images: File[], description: string) => {
    // Add user message about uploading images
    const imageMessage = `I've uploaded ${images.length} medical image${images.length > 1 ? 's' : ''}${description ? ` with description: ${description}` : ''}`;
    addMessage(imageMessage, false);
    
    if (isAuthenticated) {
      try {
        const diagnosisResponse = await diagnosisService.getDiagnosis({
          symptoms: description || "Please analyze these medical images",
          images: images
        });
        
        setTimeout(() => {
          addMessage(`Based on the uploaded images: ${diagnosisResponse.diagnosis}`, true);
          setQuickReplies(["Find specialist", "Get second opinion", "More questions", "Emergency contact"]);
        }, 2000);
      } catch (error) {
        setTimeout(() => {
          addMessage("I've received your images. For image analysis, please consult with a healthcare professional for accurate interpretation.", true);
          setQuickReplies(["Find doctor", "Upload more", "Emergency contact"]);
        }, 1500);
      }
    } else {
      setTimeout(() => {
        addMessage("I've received your images. For detailed image analysis, please sign in for personalized assistance or consult with a healthcare professional.", true);
        setQuickReplies(["Sign in", "Find doctor", "Emergency contact"]);
      }, 1500);
    }
  };

  const handleAuthSuccess = () => {
    const user = authService.getCurrentUser();
    setIsAuthenticated(true);
    setCurrentUser(user);
    
    addMessage(`Welcome back, ${user?.firstName}! I now have access to your health profile for more personalized assistance.`, true);
    setQuickReplies(["View my records", "Check symptoms", "Upload images", "Find clinic"]);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      
      addMessage("You've been signed out. Your conversation will continue with general health guidance.", true);
      setQuickReplies(["Sign in", "General tips", "Emergency contact", "Find clinic"]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
    addMessage("Hello! I'm your medical assistant. I'm here to help answer your health questions and provide guidance. How can I assist you today?", true);
    setQuickReplies(initialQuickReplies);
  };

  const handleSymptomCheckerComplete = (symptoms: string[], urgency: string) => {
    const symptomsText = symptoms.join(", ");
    addMessage(`I've recorded these symptoms: ${symptomsText}. Urgency level: ${urgency}`, false);
    
    let response = "";
    if (urgency === "urgent") {
      response = "Based on your symptoms and urgency level, I strongly recommend seeking immediate medical attention. Please consider visiting an emergency room or calling 911 if symptoms are severe.";
    } else if (urgency === "moderate") {
      response = "Your symptoms warrant medical attention. I recommend contacting your doctor or visiting an urgent care center within the next 24 hours.";
    } else {
      response = "Your symptoms appear to be mild. Here are some general recommendations, but please consult with a healthcare provider if symptoms persist or worsen.";
    }
    
    setTimeout(() => {
      addMessage(response, true);
      setQuickReplies(["Find nearby clinic", "Emergency contact", "More questions", "Prevention tips"]);
    }, 1000);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  // Fetch user location and facilities on mount
  useEffect(() => {
    const fetchLocationAndFacilities = async () => {
      if (!navigator.geolocation) {
        setUserLocation({ lat: 40.7128, lng: -74.006 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(location);
          try {
            const data = await diagnosisService.getNearbyFacilities({
              location,
              diagnosis: "general",
              preferences: { urgency: "normal" },
            });
            setFacilities(data);
          } catch (error) {
            console.error('Failed to fetch facilities:', error);
          }
        },
        () => {
          setUserLocation({ lat: 40.7128, lng: -74.006 });
        }
      );
    };

    if (!showWelcome) {
      fetchLocationAndFacilities();
    }
  }, [showWelcome]);

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Fixed Header with Dark Mode Toggle for Welcome Screen */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end p-4 bg-background/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
        <WelcomeScreen onGetStarted={handleGetStarted} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen bg-background flex flex-col">
          {/* Fixed Header */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-[1.125rem] font-medium text-foreground">Medical Assistant</h1>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-[0.75rem] font-normal text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/reports', { state: { messages } })}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Reports
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSymptomChecker(true)}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  <Stethoscope className="w-4 h-4 mr-1" />
                  Symptoms
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImageUpload(true)}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Images
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClinicFinder(true)}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Find Care
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmergencyDialog(true)}
                  className="text-destructive hover:text-destructive/80 text-sm font-medium"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Emergency
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {isAuthenticated ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <MoreVertical className="w-4 h-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAuthenticated ? (
                      <>
                        <DropdownMenuItem onClick={() => setShowUserProfile(true)}>
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowHealthRecords(true)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Health Records
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => setShowLoginDialog(true)}>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {/* Medical Disclaimer */}
            <div className="bg-warning/10 border-b border-warning/20 p-3">
              <div className="flex items-center gap-2 text-xs text-warning-foreground">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span>This chatbot provides general health information and does not replace professional medical advice.</span>
              </div>
            </div>
          </div>
          {/* Chat Messages - with top padding for fixed header */}
          <div className="pt-32 pb-4 flex-1">
            <ScrollArea ref={scrollAreaRef} className="h-full px-4">
              <div className="py-4 space-y-4">
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message.content}
                    isBot={message.isBot}
                    timestamp={message.timestamp}
                  />
                ))}
                {isTyping && (
                  <ChatBubble
                    message=""
                    isBot={true}
                    timestamp={formatTimestamp()}
                    isTyping={true}
                  />
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Bottom Section */}
          <div className="bg-background border-t border-border">
            {/* Quick Replies */}
            <QuickReplies options={quickReplies} onSelect={handleQuickReply} />
            {/* Chat Input */}
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={isTyping}
              placeholder="Type your health question..."
            />
          </div>
          {/* Modals */}
          <SymptomChecker
            open={showSymptomChecker}
            onOpenChange={setShowSymptomChecker}
            onComplete={handleSymptomCheckerComplete}
          />
          <EmergencyDialog
            open={showEmergencyDialog}
            onOpenChange={setShowEmergencyDialog}
          />
          <ImageUpload
            open={showImageUpload}
            onOpenChange={setShowImageUpload}
            onComplete={handleImageUpload}
          />
          <HealthRecords
            open={showHealthRecords}
            onOpenChange={setShowHealthRecords}
          />
          <ClinicFinder
            open={showClinicFinder}
            onOpenChange={setShowClinicFinder}
          />
          <LoginDialog
            open={showLoginDialog}
            onOpenChange={setShowLoginDialog}
            onSuccess={handleAuthSuccess}
          />
          <UserProfile
            open={showUserProfile}
            onOpenChange={setShowUserProfile}
          />
        </div>
      } />
      <Route path="/reports" element={<ReportPage />} />
    </Routes>
  );
}