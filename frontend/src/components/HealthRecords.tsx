import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Upload, 
  X, 
  Calendar, 
  User, 
  Search, 
  Filter,
  Download,
  Trash2,
  Plus,
  AlertCircle,
  Loader2,
  FileImage,
  FilePlus
} from "lucide-react";
import { healthRecordsService, HealthRecord, UploadRecordRequest } from "@/services/healthRecordsService";

interface HealthRecordsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const recordTypeLabels = {
  'lab_result': 'Lab Result',
  'prescription': 'Prescription',
  'visit_note': 'Visit Note',
  'imaging': 'Imaging',
  'vaccination': 'Vaccination',
  'other': 'Other'
};

const recordTypeIcons = {
  'lab_result': FileText,
  'prescription': FilePlus,
  'visit_note': FileText,
  'imaging': FileImage,
  'vaccination': FilePlus,
  'other': FileText
};

export function HealthRecords({ open, onOpenChange }: HealthRecordsProps) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState<UploadRecordRequest>({
    type: 'other',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    provider: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      loadRecords();
    }
  }, [open]);

  useEffect(() => {
    filterRecords();
  }, [records, searchQuery, selectedType]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await healthRecordsService.getRecords();
      setRecords(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load health records");
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = records;
    
    if (searchQuery) {
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.provider?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedType !== "all") {
      filtered = filtered.filter(record => record.type === selectedType);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredRecords(filtered);
  };

  const handleUpload = async () => {
    try {
      setUploadLoading(true);
      setError("");
      
      const uploadData = {
        ...uploadForm,
        file: selectedFile || undefined
      };
      
      await healthRecordsService.uploadRecord(uploadData);
      await loadRecords();
      
      // Reset form
      setUploadForm({
        type: 'other',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        provider: ''
      });
      setSelectedFile(null);
      setShowUploadForm(false);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to upload record");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownload = async (record: HealthRecord) => {
    try {
      if (!record.fileUrl) return;
      
      const blob = await healthRecordsService.downloadRecordFile(record.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${record.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download file");
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    
    try {
      await healthRecordsService.deleteRecord(recordId);
      await loadRecords();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete record");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[1.25rem] font-medium text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Health Records
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!showUploadForm ? (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 py-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(recordTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowUploadForm(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </div>

            {/* Records List */}
            <ScrollArea className="flex-1 pr-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Records Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {records.length === 0 
                      ? "Start by uploading your first health record."
                      : "Try adjusting your search or filter criteria."
                    }
                  </p>
                  <Button onClick={() => setShowUploadForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Record
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRecords.map((record) => {
                    const IconComponent = recordTypeIcons[record.type];
                    return (
                      <Card key={record.id} className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="text-[1rem] font-medium text-foreground truncate">
                                  {record.title}
                                </h4>
                                <div className="flex items-center gap-4 mt-1 text-[0.875rem] text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(record.date)}
                                  </div>
                                  {record.provider && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {record.provider}
                                    </div>
                                  )}
                                </div>
                                {record.description && (
                                  <p className="text-[0.875rem] text-muted-foreground mt-2 line-clamp-2">
                                    {record.description}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant="secondary" className="text-[0.75rem]">
                                  {recordTypeLabels[record.type]}
                                </Badge>
                                <div className="flex gap-1">
                                  {record.fileUrl && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDownload(record)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(record.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          /* Upload Form */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[1.125rem] font-medium">Add New Record</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowUploadForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recordType">Record Type</Label>
                <Select
                  value={uploadForm.type}
                  onValueChange={(value: any) => setUploadForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(recordTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recordDate">Date</Label>
                <Input
                  id="recordDate"
                  type="date"
                  value={uploadForm.date}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, date: e.target.value }))}
                  disabled={uploadLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recordTitle">Title</Label>
              <Input
                id="recordTitle"
                placeholder="e.g., Blood Test Results, Prescription for..."
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                disabled={uploadLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recordProvider">Provider (Optional)</Label>
              <Input
                id="recordProvider"
                placeholder="Doctor or facility name"
                value={uploadForm.provider}
                onChange={(e) => setUploadForm(prev => ({ ...prev, provider: e.target.value }))}
                disabled={uploadLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recordDescription">Description (Optional)</Label>
              <Textarea
                id="recordDescription"
                placeholder="Additional notes or details about this record..."
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                disabled={uploadLoading}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>File (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  disabled={uploadLoading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-[0.875rem] font-medium">
                        {selectedFile ? selectedFile.name : "Choose file to upload"}
                      </p>
                      <p className="text-[0.75rem] text-muted-foreground">
                        PDF, DOC, or image files up to 10MB
                      </p>
                    </div>
                  </div>
                </label>
                {selectedFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="mt-2"
                    disabled={uploadLoading}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove file
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUploadForm(false)}
                disabled={uploadLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!uploadForm.title.trim() || uploadLoading}
                className="flex-1"
              >
                {uploadLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Record
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}