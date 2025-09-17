# Frontend Design Guidelines for Medical Chatbot – Figma

## 1. Overview

This document outlines the design standards for building a frontend UI in Figma for a chatbot intended for medical use. The goal is to ensure a clean, professional, accessible, and trustworthy interface, suitable for handling sensitive health-related user interactions.

---

## 2. Project Setup in Figma

* **File Naming**: Use clear, consistent naming like `MedicalChatbot_UI_v1.0`
* **Pages to Include**:

  * Cover
  * Design System
  * Wireframes
  * UI Design
  * Prototypes
  * Dev Handoff
* **Versioning**: Tag versions (e.g. `v1.0 – Initial`, `v1.1 – Feedback Incorporated`)

---

## 3. Design System

### Color Palette

Use calm and professional colors suitable for medical applications.

| Purpose      | Color Code | Description          |
| ------------ | ---------- | -------------------- |
| Primary      | #2D6CDF    | Trust Blue           |
| Accent       | #5AC8FA    | Light Blue           |
| Success      | #34C759    | Positive Feedback    |
| Warning      | #FFCC00    | Cautionary Message   |
| Error        | #FF3B30    | Critical/Error State |
| Background   | #F8F9FA    | Light Neutral BG     |
| Text Primary | #1C1C1E    | Main Body Text       |

### Typography

Use system fonts or widely supported, accessible fonts.

* **Recommended Fonts**: Inter, Roboto, SF Pro
* **Font Sizes**:

  * Heading 1 (H1): 32pt
  * Heading 2 (H2): 24pt
  * Heading 3 (H3): 20pt
  * Subtitle: 18pt
  * Body Text: 16pt
  * Secondary Text: 14pt
  * Chat Text: 14pt
  * Button Text: 16pt (bold)
  * Small Text (e.g., timestamps): 12pt

### Components

Create reusable, scalable components with Auto Layout and Variants.

* Button (Primary, Secondary, Disabled)
* Chat Bubbles (User and Bot)
* Input Field (Active, Inactive, Error)
* Modal/Dialog Box
* Icons (Use from Feather, Material, or SF Symbols)
* Status Tags (e.g., Processing, Completed, Error)

Use constraints and responsiveness for different screen sizes.

---

## 4. UX Principles

### Clarity and Simplicity

* Minimize cognitive load
* Use short, clear, and user-friendly language
* Avoid unnecessary medical jargon

### Trust and Safety

* Always show bot identity (name, avatar)
* Display privacy notice or disclaimer clearly
* Show message timestamps for accountability
* Provide access to emergency contact or human support

### Message Flow

* Bot messages: left-aligned
* User messages: right-aligned
* Support for:

  * Quick replies (chips/buttons)
  * Typing indicators
  * Loading animations

### Onboarding

* Include a welcome screen or intro wizard
* Explain chatbot capabilities and limitations
* Get user consent before collecting sensitive data

---

## 5. Accessibility (WCAG 2.1 AA)

Design must meet accessibility standards.

* Minimum contrast ratio: 4.5:1 for text
* Support keyboard navigation and visible focus states
* Avoid using color as the only way to convey information
* All icons/images should include accessible labels or alt text
* Use readable font sizes (≥ 14pt for body text)

---

## 6. Compliance Considerations

While frontend cannot enforce compliance, it must support HIPAA/GDPR-friendly behaviors.

* Do not collect personal health information unless necessary
* Display disclaimer: “This chatbot does not replace professional medical advice.”
* Include links to Terms of Use and Privacy Policy
* Warn users that the chatbot is not monitored 24/7
* Explicitly ask for user consent before saving or processing data

---

## 7. Testing and Prototyping

Use Figma’s prototype mode to simulate:

* Chat flow interactions
* Message input and reply sequence
* Modal behavior (e.g., symptom checker)
* Loading and error states

Conduct usability testing with a diverse set of users, including elderly and low-vision users.

Use FigJam or comments to gather stakeholder feedback.

---

## 8. Handoff to Developers

* Use design tokens for:

  * Colors
  * Typography
  * Spacing
* Export assets in SVG, PNG (`1x`, `2x`)
* Use Figma’s Inspect panel for spacing, font specs, and measurements
* Document:

  * Component states (default, hover, focus, disabled)
  * Loading/error/success behaviors
  * Expected API integration points (e.g., message delay, typing indicator)

---

## 9. File Checklist

* [ ] Design System created
* [ ] Reusable components defined
* [ ] Responsive layout applied
* [ ] Accessibility verified
* [ ] Prototypes linked
* [ ] All icons and assets exported
* [ ] Developer handoff notes added

---

## 10. Required Screens

Ensure the following UI screens are designed and ready for handoff:

1. Welcome Screen
2. Chat Interface – Empty State
3. Chat Interface – Active Conversation
4. Input Field – Default, Focused, Error
5. Symptom Checker Modal/Dialog
6. Privacy Consent Dialog
7. Emergency Contact Prompt

---

## 11. Design Tips

* Use real-world sample questions (e.g., “I feel dizzy”)
* Maintain an empathetic and neutral tone in all copy
* Avoid overwhelming the UI with complex charts or technical data
* Plan for both light mode and dark mode versions

---

Let me know if you'd like a Figma template file or component library starter kit based on this guideline.
