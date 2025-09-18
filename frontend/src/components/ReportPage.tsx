import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { ArrowLeft, Download, FileText, MessageSquare, Send, User } from 'lucide-react';
import jsPDF from 'jspdf';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  online: boolean;
}

const mockDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Sarah Johnson', specialty: 'General Medicine', online: true },
  { id: '2', name: 'Dr. Michael Chen', specialty: 'Cardiology', online: false },
  { id: '3', name: 'Dr. Emily Davis', specialty: 'Neurology', online: true },
];

export function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const messages: Message[] = location.state?.messages || [];
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [messageText, setMessageText] = useState('');
  const [doctorMessages, setDoctorMessages] = useState<{ [key: string]: Message[] }>({});

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Medical Consultation Report', 20, 20);

    doc.setFontSize(12);
    let y = 40;

    // Patient Symptoms
    doc.setFontSize(14);
    doc.text('Patient Symptoms:', 20, y);
    y += 10;
    doc.setFontSize(12);

    const patientMessages = messages.filter(msg => !msg.isBot);
    patientMessages.forEach((msg) => {
      const lines = doc.splitTextToSize(`• ${msg.content}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 5;
    });

    y += 10;

    // Diagnosis
    doc.setFontSize(14);
    doc.text('Diagnosis:', 20, y);
    y += 10;
    doc.setFontSize(12);

    const botMessages = messages.filter(msg => msg.isBot);
    botMessages.forEach((msg) => {
      const lines = doc.splitTextToSize(msg.content, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 5;

      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    });

    y += 10;

    // Recommendations
    doc.setFontSize(14);
    doc.text('Recommendations:', 20, y);
    y += 10;
    doc.setFontSize(12);

    const recommendations = [
      'Consult with a healthcare professional for proper diagnosis',
      'Monitor symptoms and seek immediate care if they worsen',
      'Consider visiting nearby medical facilities for evaluation',
      'Keep track of symptom progression and any new developments'
    ];

    recommendations.forEach((rec) => {
      const lines = doc.splitTextToSize(`• ${rec}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 5;

      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    });

    // Footer
    y += 10;
    doc.setFontSize(10);
    doc.text(`Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, y);

    doc.save('medical-report.pdf');
  };

  const generateJSON = () => {
    const dataStr = JSON.stringify({ messages, timestamp: new Date().toISOString() }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'medical-report.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const sendMessageToDoctor = () => {
    if (!selectedDoctor || !messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setDoctorMessages(prev => ({
      ...prev,
      [selectedDoctor.id]: [...(prev[selectedDoctor.id] || []), newMessage]
    }));

    setMessageText('');

    // Mock doctor response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thank you for your message. This is Dr. ${selectedDoctor.name}. I've received your consultation report and will review it shortly.`,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setDoctorMessages(prev => ({
        ...prev,
        [selectedDoctor.id]: [...(prev[selectedDoctor.id] || []), response]
      }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
          <h1 className="text-xl font-semibold">Medical Report & Doctor Communication</h1>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Chat Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Consultation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Button onClick={generatePDF} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF Report
              </Button>
              <Button variant="outline" onClick={generateJSON} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download JSON Report
              </Button>
            </div>

            <ScrollArea className="h-96 border rounded p-4">
              <div className="space-y-6">
                {messages.length === 0 ? (
                  <div className="text-muted-foreground">No report available.</div>
                ) : (
                  <div className="space-y-4">
                    {/* Patient Symptoms */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-primary">Patient Symptoms</h4>
                      <div className="text-sm space-y-1">
                        {messages
                          .filter(msg => !msg.isBot)
                          .map((msg, index) => (
                            <div key={msg.id} className="flex items-start gap-2">
                              <span className="text-muted-foreground">•</span>
                              <span>{msg.content}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-primary">Diagnosis</h4>
                      <div className="text-sm space-y-1">
                        {messages
                          .filter(msg => msg.isBot)
                          .map((msg, index) => (
                            <div key={msg.id} className="text-muted-foreground">
                              {msg.content}
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-primary">Recommendations</h4>
                      <div className="text-sm text-muted-foreground">
                        Based on the symptoms described, we recommend:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Consult with a healthcare professional for proper diagnosis</li>
                          <li>Monitor symptoms and seek immediate care if they worsen</li>
                          <li>Consider visiting nearby medical facilities for evaluation</li>
                          <li>Keep track of symptom progression and any new developments</li>
                        </ul>
                      </div>
                    </div>

                    {/* Report Date */}
                    <div className="pt-4 border-t">
                      <div className="text-xs text-muted-foreground">
                        Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Doctor Messaging */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Doctor Communication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Doctor List */}
              <div>
                <h3 className="font-medium mb-3">Available Doctors</h3>
                <div className="space-y-2">
                  {mockDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedDoctor?.id === doctor.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-sm">{doctor.name}</div>
                          <div className="text-xs text-muted-foreground">{doctor.specialty}</div>
                        </div>
                        <Badge variant={doctor.online ? 'default' : 'secondary'} className="ml-auto">
                          {doctor.online ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="md:col-span-2">
                {selectedDoctor ? (
                  <div className="h-96 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4" />
                      <span className="font-medium">Chat with {selectedDoctor.name}</span>
                      <Badge variant={selectedDoctor.online ? 'default' : 'secondary'}>
                        {selectedDoctor.online ? 'Online' : 'Offline'}
                      </Badge>
                    </div>

                    <ScrollArea className="flex-1 border rounded p-3 mb-3">
                      <div className="space-y-3">
                        {(doctorMessages[selectedDoctor.id] || []).map((msg) => (
                          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[70%] p-2 rounded ${
                              msg.isBot
                                ? 'bg-muted'
                                : 'bg-primary text-primary-foreground'
                            }`}>
                              <div className="text-xs opacity-70">{msg.timestamp}</div>
                              <div className="text-sm">{msg.content}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessageToDoctor()}
                      />
                      <Button onClick={sendMessageToDoctor} disabled={!messageText.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-muted-foreground">
                    Select a doctor to start messaging
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
