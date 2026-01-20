# TPC Global Onboarding Guide

## Project Overview

TPC Global is a React-based web application built with TypeScript, Vite, and Supabase. It's a member-only platform with a referral-based invitation system, comprehensive user management, and multilingual support (English/Indonesian).

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Router** for navigation

### Backend
- **Supabase** for authentication, database, and storage
- **PostgreSQL** database with Row Level Security (RLS)
- **File storage** for user avatars

## Key Features

### Authentication System
- **Referral-based registration**: New users require a valid referral code
- **Email/password authentication** with Supabase Auth
- **Profile completion** required after signup
- **Role-based access control**: Member, Moderator, Admin, Super Admin
- **Session management** with local/global signout options

### User Management
- **Profile system** with avatar uploads
- **Referral tracking** and analytics
- **Member directory** with search functionality
- **Verification system** for member status
- **Vendor marketplace** for approved vendors

### Content Management
- **News system** with categories and tags
- **Announcements** with bilingual support
- **Admin dashboard** for content management

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── guards/         # Route protection components
│   └── ...
├── pages/              # Page components
│   ├── auth/           # Sign up, sign in, password reset
│   ├── member/         # Member-only pages
│   ├── admin/          # Admin-only pages
│   └── ...
├── lib/                # Utility libraries
│   └── supabase.ts     # Supabase client and functions
├── contexts/           # React contexts
├── i18n/              # Internationalization
├── router/            # Route configuration
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## Database Schema

### Core Tables
- **profiles**: User profiles with referral system
- **referrals**: Referral relationships
- **news_posts**: News articles with bilingual content
- **announcements**: System announcements
- **member_onboarding**: Onboarding progress tracking

### Security Features
- **Row Level Security (RLS)** on all tables
- **Referral validation** enforced at database level
- **Role-based permissions** through RLS policies
- **Admin action logging** for audit trails

## Development Setup

### Prerequisites
- Node.js (18+)
- npm or yarn
- Supabase account and project

### Environment Variables
Create a `.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## Key Development Concepts

### Authentication Flow
1. User signs up with valid referral code
2. Email verification required
3. Profile completion mandatory
4. Access granted to member features

### Referral System
- **Unique codes**: TPC-XXXXXX format
- **Validation**: Database-enforced referral checking
- **Tracking**: Comprehensive referral analytics
- **Rewards**: Referral count tracking for gamification

### Role Hierarchy
1. **Super Admin**: Full system access
2. **Admin**: User management and content control
3. **Moderator**: Content moderation
4. **Member**: Standard member access

### Multilingual Support
- **English and Indonesian** language support
- **URL-based language switching**: `/en/` or `/id/`
- **Bilingual content** for news and announcements

## Important Files

### Configuration
- `vite.config.ts`: Vite configuration
- `tailwind.config.js`: TailwindCSS setup
- `tsconfig.json`: TypeScript configuration

### Core Logic
- `src/lib/supabase.ts`: All database interactions
- `src/App.tsx`: Main application router
- `src/router/`: Route definitions and guards

### Database
- `supabase/migrations/`: Database schema migrations
- Multiple SQL files for feature-specific setups

## Development Guidelines

### Code Style
- **TypeScript strict mode** enabled
- **ESLint** for code quality
- **Component-based architecture**
- **Custom hooks** for state management

### Security Best Practices
- **RLS policies** for all database operations
- **Input validation** on both client and server
- **Admin action logging** for audit trails
- **Secure file uploads** with validation

### Performance
- **Lazy loading** for routes
- **Optimized images** with proper sizing
- **Efficient database queries** with proper indexing
- **Caching strategies** for frequently accessed data

## Testing

### Manual Testing Checklist
- [ ] Referral code validation
- [ ] User registration flow
- [ ] Email verification
- [ ] Profile completion
- [ ] Role-based access control
- [ ] File upload functionality
- [ ] Multilingual switching
- [ ] Admin dashboard functionality

### Database Testing
- [ ] RLS policy enforcement
- [ ] Referral system integrity
- [ ] Admin action logging
- [ ] Data consistency checks

## Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Configure production Supabase instance
- Set up proper environment variables
- Configure domain and SSL
- Set up monitoring and logging

## Common Issues & Solutions

### Referral Code Issues
- Ensure referral codes are properly generated
- Check RLS policies for referral validation
- Verify trigger functions are working

### Authentication Problems
- Check Supabase configuration
- Verify email templates are set up
- Ensure proper redirect URLs

### Performance Issues
- Optimize database queries
- Implement proper caching
- Use lazy loading for components

## Support

For technical issues:
1. Check browser console for errors
2. Verify Supabase connection
3. Review database logs
4. Check environment variables

## Future Enhancements

### Planned Features
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] API rate limiting
- [ ] Advanced search functionality

### Technical Improvements
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Security audit
- [ ] Code coverage reporting
