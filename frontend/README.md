# DiagnosAI Frontend

A modern React TypeScript frontend for the DiagnosAI health chatbot application.

## Features

- 🤖 **AI-Powered Health Assistant** - Interactive chat with medical guidance
- 🩺 **Symptom Checker** - Comprehensive symptom assessment tool
- 📸 **Medical Image Upload** - Upload and analyze medical images
- 📋 **Health Records Management** - Secure storage and management of health records
- 🏥 **Clinic Finder** - Find nearby medical facilities with directions
- 🚨 **Emergency Contacts** - Quick access to emergency services
- 👤 **User Authentication** - Secure login and profile management
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Optimized for all device sizes
- 🔒 **HIPAA Compliant** - Secure handling of medical information

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons
- **Axios** for API communication
- **ESLint** for code quality

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on http://localhost:8000

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── auth/           # Authentication-related components
│   ├── ChatBubble.tsx  # Chat message component
│   ├── ChatInput.tsx   # Message input component
│   ├── SymptomChecker.tsx
│   ├── ImageUpload.tsx
│   ├── HealthRecords.tsx
│   ├── ClinicFinder.tsx
│   └── EmergencyDialog.tsx
├── services/           # API service layers
│   ├── authService.ts
│   ├── diagnosisService.ts
│   └── healthRecordsService.ts
├── lib/               # Utility libraries
│   └── api.ts        # Axios configuration
├── styles/           # Global styles
│   └── globals.css
├── App.tsx          # Main application component
└── main.tsx        # Application entry point
```

## API Integration

The frontend integrates with the FastAPI backend through several service layers:

- **Authentication Service** - User login, registration, and profile management
- **Diagnosis Service** - AI-powered health diagnosis and symptom analysis
- **Health Records Service** - Medical record storage and retrieval

## Features in Detail

### Chat Interface
- Real-time chat with AI health assistant
- Quick reply suggestions based on context
- Typing indicators and message timestamps
- Support for both text and image messages

### Symptom Checker
- Categorized symptom selection
- Urgency level assessment
- Personalized recommendations based on severity

### Medical Image Upload
- Drag-and-drop file upload
- Support for JPEG, PNG, WebP formats
- File validation and progress tracking
- Integration with AI image analysis

### Health Records Management
- Secure upload and storage of medical documents
- Categorized record types (lab results, prescriptions, etc.)
- Search and filter functionality
- Download and delete capabilities

### Clinic Finder
- Location-based medical facility search
- Filter by facility type (hospital, clinic, pharmacy)
- Integration with mapping services
- Contact information and directions

### User Authentication
- Secure login and registration
- Profile management with medical history
- Emergency contact information
- Medication and allergy tracking

## Security & Privacy

- All API communications use HTTPS
- JWT-based authentication
- Local storage for session management
- HIPAA-compliant data handling
- No sensitive data stored in browser storage

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Follow the existing code style and patterns
2. Write TypeScript with proper type definitions
3. Use Tailwind CSS for styling
4. Ensure components are accessible
5. Test on multiple devices and browsers

## License

This project is part of DiagnosAI and is proprietary software.

## Support

For technical support or questions about the frontend application, please contact the development team.