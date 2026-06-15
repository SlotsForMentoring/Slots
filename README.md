# Pair Scheduling

A full-stack scheduling platform that connects trainees with volunteers for 1:1 mentoring sessions based on real-time availability.

The project was designed to solve the problem of fragmented booking workflows where trainees must manually search through multiple Calendly or Google Calendar links to find available sessions. Instead, this platform centralizes volunteer availability into a single accessible scheduling system.

# Problem Statement

Currently, volunteers share separate scheduling links, which creates friction for trainees trying to book support sessions. Searching across many calendars is time-consuming and discouraging, resulting in missed learning opportunities and lower engagement.

# This application simplifies the process by allowing trainees to view and instantly book available volunteer time slots in one place.

Features
Volunteer Features
Create one-time availability slots
Create recurring weekly availability
Edit or cancel offered sessions
Configure minimum booking notice window
Receive calendar invitations automatically
Trainee Features
Browse all available mentoring sessions
Book 1:1 sessions with volunteers
Add session agenda or notes
Receive Google Meet invitation links
Cancel booked sessions
Administrator Features
Manage users
Cancel sessions
Remove or ban users
Moderate platform activity
Booking Flow
Volunteer creates availability slots
Trainee browses available sessions
Trainee books a slot
Slot becomes unavailable immediately
Calendar invite + Google Meet link are sent automatically
Technical Goals
Accessible UI/UX
Responsive design
Real-time slot availability
Secure authentication
Prevent double-booking
Calendar integration support
Automated notifications
Tested and deployable architecture
Nice-to-Have Features
Google Calendar synchronization
Automatic conflict detection
Session reminders
Session history
Volunteer expertise filters
Admin moderation dashboard
Tech Stack
Frontend
React
TypeScript
Tailwind CSS / Material UI
Backend
Node.js
Express
Database
PostgreSQL
Authentication
JWT Authentication
Deployment
Vercel / Render / Railway
Accessibility

The platform is designed with accessibility in mind:

keyboard navigation
screen reader support
semantic HTML
responsive layouts
accessible forms and controls
Project Scope

Authentication is included to identify volunteers and trainees.

Advanced authorization and role verification workflows are intentionally outside the scope of the initial MVP.

Future Improvements
AI-based volunteer matching
Smart scheduling recommendations
Multi-language support
Analytics dashboard
Integrated messaging/chat
Mobile application
