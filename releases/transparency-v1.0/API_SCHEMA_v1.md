# Public API v1 Schema Documentation

## Version Information
- **API Version:** v1.0
- **Status:** Locked (Backward Compatible)
- **Base URL:** `/functions/v1/tpc-public-api/public/v1`
- **Authentication:** Public (read-only)

## Response Contract

### Standard Response Format
```json
{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "endpoint_name",
    "limit": 10
  },
  "data": [...]
}
```

### Error Response Format
```json
{
  "ok": false,
  "version": "v1",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Endpoints

### 1. Get Aggregated Totals
**Endpoint:** `GET /totals`

**Response:**
```json
{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "totals"
  },
  "data": {
    "total_revenue": "1234567.890123",
    "total_distributed": "987654.321098",
    "total_transactions": 1234,
    "last_updated": "2026-01-26T00:00:00.000Z"
  }
}
```

### 2. Get Daily Summaries
**Endpoint:** `GET /daily`

**Query Parameters:**
- `limit` (optional, default: 30): Number of days to return

**Response:**
```json
{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "daily",
    "limit": 30
  },
  "data": [
    {
      "date": "2026-01-26",
      "revenue": "12345.678901",
      "distributed": "9876.543210",
      "transactions": 12
    }
  ]
}
```

### 3. Get Distribution Batches
**Endpoint:** `GET /batches`

**Query Parameters:**
- `limit` (optional, default: 10): Number of batches to return

**Response:**
```json
{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "batches",
    "limit": 10
  },
  "data": [
    {
      "id": "uuid",
      "created_at": "2026-01-26T00:00:00.000Z",
      "period_start": "2026-01-25T00:00:00.000Z",
      "period_end": "2026-01-26T00:00:00.000Z",
      "tx_count": 5,
      "revenue_sum": "1000.000000",
      "referral_sum": "100.000000",
      "treasury_sum": "200.000000",
      "buyback_sum": "50.000000",
      "public_hash": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
      "onchain_tx": "3AbcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdef",
      "note": "Auto distribution batch"
    }
  ]
}
```

### 4. Get Public Wallets
**Endpoint:** `GET /wallets`

**Response:**
```json
{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "wallets"
  },
  "data": [
    {
      "name": "Treasury",
      "address": "11111111111111111111111111111112",
      "type": "treasury",
      "explorer_url": "https://solscan.io/account/11111111111111111111111111111112"
    },
    {
      "name": "Distribution",
      "address": "22222222222222222222222222222223",
      "type": "distribution",
      "explorer_url": "https://solscan.io/account/22222222222222222222222222222223"
    }
  ]
}
```

### 5. Get Changelog
**Endpoint:** `GET /changelog`

**Query Parameters:**
- `limit` (optional, default: 20): Number of entries to return

**Response:**
```json
{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "changelog",
    "limit": 20
  },
  "data": [
    {
      "id": "uuid",
      "created_at": "2026-01-26T00:00:00.000Z",
      "key": "distribution_split",
      "old_value": "50-30-20",
      "new_value": "60-25-15",
      "reason": "Updated distribution percentages",
      "admin_id": "uuid"
    }
  ]
}
```

## Data Types

### Numeric Fields
- All monetary values are strings with 6 decimal places
- Example: "1234567.890123"

### Timestamp Fields
- All timestamps are ISO 8601 format
- Example: "2026-01-26T00:00:00.000Z"

### UUID Fields
- All IDs are UUID v4 format
- Example: "123e4567-e89b-12d3-a456-426614174000"

## Rate Limiting
- **Limit:** 100 requests per minute per IP
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Backward Compatibility Guarantee
- v1.0 schema is frozen and will not change
- New fields may be added (optional)
- Existing fields will not be removed or renamed
- Breaking changes will require v2.0

## Error Codes
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_PARAMETERS`: Invalid query parameters
- `INTERNAL_ERROR`: Server error
- `NOT_FOUND`: Endpoint not found
