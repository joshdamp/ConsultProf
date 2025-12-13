# ConsultProf - Student-Professor Consultation Scheduling

A modern, mobile-first web application for managing student-professor consultation appointments. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### For Students
- Browse and search professors by name/department
- View professor weekly schedules
- Request consultations with date/time selection
- Track booking status (pending/confirmed/declined)
- Cancel bookings
- Mobile-responsive interface

### For Professors
- Create and manage weekly schedules (Mon-Fri, 7AM-8:45PM)
- Review incoming consultation requests
- Accept or decline requests
- View all confirmed consultations
- Email notifications for new requests

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- **State Management**: Zustand + React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Date/Time**: date-fns
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Git

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd ConsultProf
npm install
```

### 2. Supabase Setup

#### A. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning
3. Go to **Project Settings** → **API**
4. Copy your `Project URL` and `anon public` key

#### B. Run Database Schema
1. Go to **SQL Editor** in Supabase dashboard
2. Copy the entire contents of `supabase/schema.sql`
3. Paste and click **Run**
4. Verify all tables were created successfully

#### C. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🗄️ Database Schema

### Tables
- **profiles**: User information (linked to Supabase Auth)
- **professors**: Professor-specific details
- **professor_schedules**: Weekly availability schedules
- **bookings**: Consultation requests and bookings

### Row Level Security (RLS)
All tables have RLS enabled with policies for:
- Students can only view/edit their own bookings
- Professors can view/edit their own schedules and requests
- Public read access for professor profiles (authenticated users)

## 📧 Email Notifications (Optional)

The app includes a Supabase Edge Function for sending email notifications to professors when students request consultations.

### Setup Email Function

#### Option 1: Using Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Deploy the edge function:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link your project
   supabase link --project-ref your-project-ref
   
   # Set secrets
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   supabase secrets set APP_URL=https://your-app-url.com
   
   # Deploy function
   supabase functions deploy send-booking-notification
   ```

#### Option 2: Call from Client Side
Uncomment the function call in `src/features/student/hooks/useStudentBookings.ts` after creating a booking.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and import your repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables
5. Deploy!

## 📱 Mobile-First Design

The app is designed mobile-first with responsive breakpoints:
- **Mobile**: Full-screen, stacked layouts, touch-friendly buttons
- **Tablet** (768px+): 2-column grids, expanded navigation
- **Desktop** (1024px+): 3-column grids, full navigation bar

## 🎨 UI Components

Built with shadcn/ui for a modern, accessible interface:
- Buttons, Inputs, Labels
- Cards, Dialogs, Dropdowns
- Tabs, Badges, Avatars
- Toast notifications
- Loading skeletons
- Empty states

## 📂 Project Structure

```
src/
├── app/
│   ├── Auth/              # Auth context & providers
│   ├── components/        # Shared UI components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities & Supabase client
│   ├── providers/        # React Query provider
│   └── types/            # TypeScript types
├── features/
│   ├── professor/        # Professor-specific features
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   └── student/          # Student-specific features
│       ├── components/
│       ├── hooks/
│       └── pages/
├── pages/                # Auth pages & protected routes
├── stores/               # Zustand stores
├── App.tsx               # Main app with routing
└── main.tsx              # Entry point
```

## 🔐 Authentication Flow

1. User signs up with email/password + role selection
2. Profile and role-specific record created automatically
3. User redirected to role-specific dashboard
4. Protected routes enforce role-based access

## 🧪 Testing the App

### Create Test Users

1. **Create a Professor Account**:
   - Go to `/signup`
   - Fill in details and select "Professor" role
   - Login and go to "My Schedule"
   - Add some schedule blocks

2. **Create a Student Account**:
   - Sign up with "Student" role
   - Browse professors
   - View a professor's schedule
   - Request a consultation

3. **Professor Reviews Request**:
   - Login as professor
   - Go to "Requests"
   - Accept or decline the request

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"
- Check that `.env` file exists and has correct values
- Restart the dev server after changing `.env`

### Issue: Database errors
- Verify schema was run successfully in Supabase
- Check RLS policies are enabled
- Ensure user is authenticated

### Issue: Routes not working
- Clear browser cache
- Check that user role matches the route requirement

## 📄 License

MIT License - feel free to use this project for learning or production.

## 🤝 Contributing

This is a complete production-ready application. Feel free to fork and customize for your needs!

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase logs in the dashboard
3. Check browser console for errors

## 🎯 Future Enhancements

Potential features to add:
- Video calling integration (Zoom, Google Meet)
- File sharing for consultations
- Calendar integration (Google Calendar, Outlook)
- SMS notifications
- Multi-language support
- Dark mode toggle
- Analytics dashboard
- Rating system for consultations

---

**Built with ❤️ for seamless student-professor communication**