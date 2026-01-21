# Email Worker

Deno-based email worker for processing TPC email queue with Resend integration.

## Features

- **Batch Processing**: Claims up to 25 emails at once
- **Atomic Locking**: Prevents duplicate processing between workers
- **Exponential Backoff**: Smart retry delays (1m to 60m max)
- **HTML Templates**: Professional email templates for all notification types
- **Error Handling**: Comprehensive error tracking and recovery
- **Monitoring**: Real-time processing statistics

## Environment Variables

Required environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service Configuration
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=TPC <noreply@tpcglobal.io>
```

## Deployment

### Using Supabase CLI

```bash
# Deploy to Supabase Edge Functions
supabase functions deploy send-emails

# Set environment variables
supabase secrets set RESEND_API_KEY=re_your_resend_api_key
supabase secrets set FROM_EMAIL=TPC <noreply@tpcglobal.io>
```

### Using Deno Deploy

```bash
# Deploy directly to Deno Deploy
deno deploy --prod --project=tpc-emails
```

## API Usage

### Invoke Worker

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-emails \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Response Format

```json
{
  "ok": true,
  "claimed": 25,
  "sent": 23,
  "failed": 2,
  "processing_time_ms": 1640998765432
}
```

## Email Templates

### Verification Approved
- Professional design with green checkmark
- Includes request ID and approval message
- Brand-consistent styling

### Verification Rejected
- Professional design with red X icon
- Includes rejection reason and request ID
- Support contact information

### Account Updated
- Professional design with refresh icon
- Lists all changes made to account
- Administrator attribution and timestamp

### Default Template
- Fallback template for generic notifications
- Simple and clean design

## Monitoring

### Queue Statistics

Monitor queue health via Supabase function:

```sql
select * from worker_get_queue_stats();
```

### Health Monitoring

View real-time queue status:

```sql
select * from email_queue_monitor;
```

## Error Handling

### Retry Logic
- Exponential backoff: 1, 2, 4, 8, 16, 32, 60 minutes
- Maximum 10 attempts before marking as FAILED
- Automatic cleanup of failed emails after 7 days

### Lock Management
- 5-minute lock duration with automatic expiration
- Stale lock detection and recovery
- Worker identification for debugging

## Performance

### Batch Processing
- Claims up to 25 emails per invocation
- FIFO ordering by creation date
- Atomic row-level locking prevents race conditions

### Scalability
- Support for multiple concurrent workers
- Load balancing through batch claiming
- Efficient database queries with proper indexing

## Security

### Input Validation
- HTML escaping prevents XSS attacks
- Template name validation
- Email address validation

### Access Control
- Supabase Row Level Security (RLS)
- Service role authentication
- Environment variable protection

## Development

### Local Development

```bash
# Install dependencies
deno cache install

# Run locally
deno run --allow-net --allow-env --allow-read=.env index.ts

# Test with curl
curl -X POST http://localhost:8000
```

### Testing

Test email templates locally:

```bash
# Test template rendering
deno run --allow-env test-templates.ts
```

## Troubleshooting

### Common Issues

1. **Environment Variables Missing**
   - Ensure all required env vars are set
   - Check Supabase and Resend API keys

2. **Database Connection**
   - Verify SUPABASE_URL is correct
   - Check service role key permissions

3. **Email Delivery**
   - Verify Resend API key is valid
   - Check FROM_EMAIL is properly configured

4. **Lock Timeouts**
   - Increase lock duration if workers are slow
   - Check for stale locks in monitoring

### Debug Mode

Enable debug logging:

```typescript
// Add to index.ts
const DEBUG = Deno.env.get("DEBUG") === "true";

if (DEBUG) {
  console.log("Debug mode enabled");
  // Additional logging
}
```

## Production Considerations

### Performance Tuning

- Adjust batch size based on email volume
- Monitor processing times and optimize
- Consider multiple workers for high volume

### Monitoring Setup

- Set up alerts for failed email rates
- Monitor queue depth and processing times
- Track worker health and restart failures

### Scaling

- Use Deno Deploy for global distribution
- Consider CDN for static assets
- Implement circuit breaker pattern for external APIs
