# TPC Presale System

Mobile-only TPC presale system with Jupiter-inspired design, supporting Indonesian and English languages.

## Features

- **Mobile Only**: Max width 430px, desktop shows redirect message
- **Bilingual**: Indonesian (default) and English support
- **Jupiter Design**: Dark theme with soft gold accents
- **Complete Presale Flow**: Email verification → Invoice → Payment → Proof upload → Admin verification
- **Payment Methods**: USDC, SOL (Solana), Indonesian banks, E-wallets
- **Admin Panel**: Invoice management, settings configuration
- **Security**: Rate limiting, audit logging, secure file uploads

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone and install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm run dev
```

4. Open your mobile browser or use mobile dev tools to:
```
http://localhost:3000
```

## Project Structure

```
tpc-presale/
├── css/
│   └── style.css          # Complete styling with Jupiter theme
├── js/
│   └── app.js             # Frontend application logic
├── uploads/               # Payment proof uploads
├── data/
│   └── presale.db         # SQLite database
├── index.html             # Main HTML file
├── server.js              # Express backend server
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
└── README.md              # This file
```

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/presale` - Get presale information
- `POST /api/send-verification` - Send email verification
- `POST /api/verify-email` - Verify email
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:invoiceNumber` - Get invoice details
- `GET /api/invoices?email=x` - Get user invoices
- `POST /api/invoices/:invoiceNumber/proof` - Upload payment proof
- `GET /api/payment-methods` - Get available payment methods

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/invoices` - Get all invoices
- `PUT /api/admin/invoices/:invoiceNumber/status` - Update invoice status
- `GET /api/admin/settings` - Get admin settings
- `PUT /api/admin/settings` - Update admin settings

## User Flow

1. **Email Entry**: User enters email and accepts terms
2. **Email Verification**: Verification email sent (auto-verified in demo)
3. **Invoice Creation**: Invoice generated and sent via email
4. **Payment**: User selects payment method and makes payment
5. **Proof Upload**: User uploads payment proof
6. **Admin Review**: Admin verifies payment proof
7. **Status Update**: User receives status update via email

## Payment Methods Supported

### Cryptocurrency
- USDC (Solana)
- SOL (Solana)

### Indonesian Banks
- BCA
- Mandiri
- BNI
- BRI

### E-Wallets
- OVO
- DANA
- GoPay

## Security Features

- Rate limiting on API endpoints
- File upload validation (images only, max 5MB)
- Audit logging for all admin actions
- Email verification required before purchase
- Secure session management
- CSRF protection
- Content Security Policy headers

## Mobile Optimization

- Responsive design optimized for mobile devices
- Touch-friendly interface
- Large tap targets
- Optimized for thumb navigation
- Desktop blocker (shows message to use mobile)

## Language Support

The system supports:
- **Indonesian (ID)** - Default language
- **English (EN)** - Secondary language

Language toggle is available in the navigation header.

## Admin Configuration

Admin can configure:
- Presale prices
- USD/IDR exchange rate
- Wallet addresses
- Bank account details
- E-wallet numbers

## Database Schema

### Users Table
- Email verification status
- Verification tokens
- Timestamps

### Invoices Table
- Invoice details
- Payment status
- Proof file references
- Admin notes

### Admin Settings Table
- Configurable payment destinations
- Presale parameters
- Exchange rates

### Audit Logs Table
- Complete audit trail
- All admin actions logged
- IP and user agent tracking

## Development

### Environment Variables

Key environment variables in `.env`:
- `PORT` - Server port (default: 3000)
- `DB_PATH` - SQLite database path
- `SMTP_*` - Email configuration
- `JWT_SECRET` - Security secret
- `ADMIN_EMAIL` - Admin login email
- `ADMIN_PASSWORD` - Admin login password

### Building for Production

```bash
npm run build
npm start
```

## Security Notes

1. Change default admin credentials in production
2. Use proper SMTP configuration for emails
3. Configure proper domain for CSP headers
4. Use HTTPS in production
5. Regular database backups recommended
6. Monitor audit logs for suspicious activity

## Browser Support

- Chrome Mobile (latest)
- Safari Mobile (latest)
- Firefox Mobile (latest)
- Samsung Internet (latest)

## License

MIT License - see LICENSE file for details.

## Support

For technical support, contact the development team or check the admin panel for system status.
