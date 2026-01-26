# Partner Onboarding - Public API v1

**Ready-to-Integrate • Read-only • Aggregated-only • No PII**

---

## 🎯 Scope & Rules (Read First)

### **Core Principles**
- ✅ **Read-only:** No write endpoints, no data modification
- ✅ **Aggregated-only:** No personal information, no PII exposure
- ✅ **Stable Contract:** v1 API frozen, backward compatible
- ✅ **Rate-limited:** Fair usage with proper headers
- ✅ **Legal-safe:** No profit/ROI/guarantee language

### **Usage Guidelines**
- **Purpose:** Public transparency verification and analysis
- **Data Type:** Aggregated marketplace and distribution data
- **Access:** Public, no authentication required
- **Compliance:** All data is anonymized and aggregated

---

## 🔗 Base URL

```
{FUNCTION_BASE_URL}/tpc-public-api/public/v1
```

**Replace `{FUNCTION_BASE_URL}` with your Supabase Edge Functions URL:**
- **Production:** `https://your-project.supabase.co/functions/v1`
- **Development:** `https://your-project.supabase.co/functions/v1`

---

## 📌 Endpoints (v1)

### **GET /metrics**
**Purpose:** System-wide aggregated totals
**Response:** Complete system metrics
**Example:** `GET /metrics`

### **GET /daily**
**Purpose:** Daily summary data
**Parameters:** 
- `days` (optional): 7, 30, or 90 (default: 30)
**Example:** `GET /daily?days=30`

### **GET /wallets**
**Purpose:** Public wallet addresses
**Response:** Treasury and distribution wallets
**Example:** `GET /wallets`

### **GET /batches**
**Purpose:** Distribution batch records
**Parameters:**
- `limit` (optional): Number of batches (default: 10)
**Example:** `GET /batches?limit=10`

### **GET /changelog**
**Purpose:** Public system changelog
**Parameters:**
- `limit` (optional): Number of entries (default: 20)
**Example:** `GET /changelog?limit=20`

---

## 📋 Response Headers

### **Rate Limiting Headers**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### **Caching Headers**
```
Cache-Control: public, max-age=300
ETag: "generated-hash-value"
```

### **Standard Headers**
```
Content-Type: application/json
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

---

## 🧱 Response Envelope (Stable)

### **Standard Response Format**
```json
{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "metrics"
  },
  "data": {
    // Endpoint-specific data
  }
}
```

### **Error Response Format**
```json
{
  "ok": false,
  "version": "v1",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests"
  }
}
```

### **Numeric Fields**
- **Format:** Can be `number` or `string` depending on client preference
- **Precision:** Monetary values have 6 decimal places
- **Example:** `"1234.567890"` or `1234.567890`

---

## 🧪 Quick Start Examples

### **JavaScript (Browser/Node.js)**
```javascript
const base = "{FUNCTION_BASE_URL}/tpc-public-api/public/v1";

// Get system metrics
async function getMetrics() {
  const response = await fetch(`${base}/metrics`);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// Get daily summaries
async function getDaily(days = 30) {
  const response = await fetch(`${base}/daily?days=${days}`);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// Get distribution batches
async function getBatches(limit = 10) {
  const response = await fetch(`${base}/batches?limit=${limit}`);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// Usage examples
getMetrics().then(data => console.log('Metrics:', data));
getDaily(7).then(data => console.log('Daily:', data));
getBatches(5).then(data => console.log('Batches:', data));
```

### **Python (Requests)**
```python
import requests
import json

base_url = "{FUNCTION_BASE_URL}/tpc-public-api/public/v1"

def get_metrics():
    response = requests.get(f"{base_url}/metrics")
    response.raise_for_status()
    return response.json()

def get_daily(days=30):
    response = requests.get(f"{base_url}/daily?days={days}")
    response.raise_for_status()
    return response.json()

def get_batches(limit=10):
    response = requests.get(f"{base_url}/batches?limit={limit}")
    response.raise_for_status()
    return response.json()

# Usage
metrics = get_metrics()
daily = get_daily(7)
batches = get_batches(5)

print("Metrics:", json.dumps(metrics, indent=2))
print("Daily:", json.dumps(daily, indent=2))
print("Batches:", json.dumps(batches, indent=2))
```

### **cURL Examples**
```bash
# Get system metrics
curl "{FUNCTION_BASE_URL}/tpc-public-api/public/v1/metrics"

# Get daily summaries (30 days)
curl "{FUNCTION_BASE_URL}/tpc-public-api/public/v1/daily?days=30"

# Get daily summaries (7 days)
curl "{FUNCTION_BASE_URL}/tpc-public-api/public/v1/daily?days=7"

# Get distribution batches
curl "{FUNCTION_BASE_URL}/tpc-public-api/public/v1/batches?limit=10"

# Get public wallets
curl "{FUNCTION_BASE_URL}/tpc-public-api/public/v1/wallets"

# Get changelog
curl "{FUNCTION_BASE_URL}/tpc-public-api/public/v1/changelog?limit=20"
```

### **Response Examples**
```json
// GET /metrics
{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "metrics"
  },
  "data": {
    "total_revenue": "1234567.890123",
    "total_distributed": "987654.321098",
    "total_transactions": 1234,
    "last_updated": "2026-01-26T00:00:00.000Z"
  }
}

// GET /daily?days=7
{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "daily",
    "limit": 7
  },
  "data": [
    {
      "date": "2026-01-26",
      "revenue": "12345.678901",
      "distributed": "9876.543210",
      "transactions": 12
    },
    {
      "date": "2026-01-25",
      "revenue": "11234.567890",
      "distributed": "8987.654321",
      "transactions": 10
    }
  ]
}
```

---

## 🔁 Best Practices

### **Caching Strategy**
```javascript
// Respect Cache-Control headers
async function getCachedData(endpoint) {
  const response = await fetch(endpoint);
  const cacheControl = response.headers.get('Cache-Control');
  const maxAge = cacheControl ? parseInt(cacheControl.split('=')[1]) : 300;
  
  // Cache data client-side according to max-age
  const data = await response.json();
  
  // Store with timestamp
  return {
    data,
    cachedAt: Date.now(),
    expiresAt: Date.now() + (maxAge * 1000)
  };
}
```

### **Rate Limit Handling**
```javascript
async function apiCall(endpoint, retries = 3) {
  try {
    const response = await fetch(endpoint);
    
    if (response.status === 429) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const waitTime = resetTime ? (parseInt(resetTime) * 1000) - Date.now() : 60000;
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return apiCall(endpoint, retries - 1);
      } else {
        throw new Error('Rate limit exceeded');
      }
    }
    
    return response.json();
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`);
  }
}
```

### **Polling Strategy**
```javascript
// Avoid aggressive polling - use 30-60 second intervals
function startPolling(endpoint, callback, interval = 60000) {
  const poll = async () => {
    try {
      const data = await apiCall(endpoint);
      callback(data);
    } catch (error) {
      console.error('Polling error:', error);
    }
    setTimeout(poll, interval);
  };
  
  poll();
}

// Usage
startPolling('/metrics', (data) => {
  console.log('Updated metrics:', data);
}, 60000); // 60 second interval
```

### **Version Management**
```javascript
// Always use /v1 endpoints (avoid legacy)
const API_VERSION = 'v1';
const BASE_URL = `${FUNCTION_BASE_URL}/tpc-public-api/public/${API_VERSION}`;

// Check API version in response
function validateVersion(response) {
  if (response.version !== API_VERSION) {
    console.warn(`API version mismatch: expected ${API_VERSION}, got ${response.version}`);
  }
}
```

---

## 🔐 Security Notes

### **Authentication**
- **No API Key Required:** Public endpoints
- **No Authentication:** Open access for transparency
- **Rate Limiting:** 100 requests per minute per IP

### **Data Security**
- **Read-only:** No write endpoints available
- **Aggregated Data:** No PII or personal information
- **Audit Trail:** All data verifiable via transparency page

### **Compliance**
- **Source of Truth:** Use transparency page for verification
- **Data Integrity:** All data cryptographically verifiable
- **Legal Compliance:** Aggregated, anonymized data only

---

## 📄 SLA (Non-binding)

### **Availability**
- **Target Uptime:** Best effort basis
- **Maintenance:** Scheduled maintenance announced via changelog
- **Incidents:** Public status page for transparency

### **Version Stability**
- **Breaking Changes:** Will increment to v2/v3 (not v1.x)
- **Minor Improvements:** Documented in public changelog
- **Backward Compatibility:** v1 endpoints remain stable

### **Performance**
- **Response Time:** Target <200ms for cached requests
- **Rate Limits:** 100 requests per minute per IP
- **Cache Duration:** 5-10 minutes depending on endpoint

---

## 📣 Contact & Attribution

### **Attribution (Recommended)**
```
Source: Public Transparency (Aggregated)
API: Transparency v1.0 (Read-only)
Data: Aggregated marketplace data
```

### **Usage Examples**
```html
<!-- Attribution in web applications -->
<div class="attribution">
  Data source: <a href="/transparency">Public Transparency (Aggregated)</a>
</div>
```

```javascript
// Attribution in data visualizations
const attribution = {
  source: "Public Transparency (Aggregated)",
  api: "Transparency v1.0",
  url: "https://example.com/transparency"
};
```

### **Special Requirements**
For custom integration needs, special use cases, or enterprise requirements:
- **Contact:** transparency@example.com
- **Response Time:** 2-3 business days
- **Support:** Best effort basis

---

## 🚀 Getting Started Checklist

### **✅ Pre-Integration**
- [ ] Read scope and rules carefully
- [ ] Replace `{FUNCTION_BASE_URL}` with actual URL
- [ ] Test basic connectivity with `/metrics` endpoint
- [ ] Review rate limiting and caching headers

### **✅ Integration**
- [ ] Implement proper error handling
- [ ] Add rate limit handling (429 responses)
- [ ] Implement client-side caching
- [ ] Add attribution where appropriate

### **✅ Testing**
- [ ] Test all required endpoints
- [ ] Verify data format and types
- [ ] Test error scenarios
- [ ] Validate against transparency page

### **✅ Deployment**
- [ ] Use appropriate polling intervals
- [ ] Monitor rate limit headers
- [ ] Implement proper logging
- [ ] Add monitoring and alerts

---

## 🎯 Integration Success

### **Key Success Metrics**
- ✅ **Data Accuracy:** API data matches transparency page
- ✅ **Performance:** Response times under 200ms
- ✅ **Reliability:** Proper error handling and retries
- ✅ **Compliance:** Proper attribution and usage

### **Common Issues & Solutions**
- **429 Errors:** Implement rate limit handling
- **Timeouts:** Add proper timeout handling
- **Data Format:** Handle both string and number formats
- **Caching:** Respect Cache-Control headers

---

## 📞 Support Resources

### **Documentation**
- **API Reference:** Complete endpoint documentation
- **Transparency Page:** Source of truth for verification
- **Changelog:** System updates and changes

### **Troubleshooting**
- **Status Page:** System health and availability
- **Error Codes:** Complete error reference
- **Best Practices:** Integration guidelines

---

**Partner onboarding complete! Your integration is ready for production use.** 🚀

**Status: 🟢 READY TO INTEGRATE** 🎯

**Key Features:**
- ✅ **Complete Documentation:** All endpoints documented
- ✅ **Code Examples:** JavaScript, Python, cURL samples
- ✅ **Best Practices:** Caching, rate limiting, error handling
- ✅ **Legal Compliance:** Attribution and usage guidelines
- ✅ **Production Ready:** SLA and support information

**Next Steps:**
1. Replace `{FUNCTION_BASE_URL}` with your Supabase URL
2. Test basic connectivity
3. Implement your integration
4. Add attribution and monitoring

Your partner integration is now ready for transparent data consumption! 📊🔗🎯
