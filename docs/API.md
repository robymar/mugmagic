# API Documentation - MugMagic

**Base URL:** `https://mugmagic.com/api` (Production) | `http://localhost:3000/api` (Development)

**Version:** 1.0  
**Last Updated:** 22 December 2024

---

## Table of Contents
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Products](#products)
  - [Orders](#orders)
  - [Payment](#payment)

---

## Authentication

Most endpoints are public. Admin endpoints require authentication via Supabase session.

### Headers
```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

---

## Rate Limiting

All endpoints have rate limiting to prevent abuse.

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/login | 5 requests | 1 minute |
| POST /track-order | 10 requests | 1 minute |
| POST /products | 10 requests | 1 minute |
| PUT/DELETE /products/[id] | 20 requests | 1 minute |

**Response when rate limited:**
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
```
```json
{
  "error": "Too many requests",
  "retryAfter": 45
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Endpoints

### Auth

#### POST /api/auth/login
Login with email and password.

**Rate Limit:** 5 req/min per IP

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation:**
- `email`: Valid email format
- `password`: Minimum 6 characters

**Response (200):**
```json
{
  "success": true
}
```

**Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

**Response (429):**
```json
{
  "error": "Too many login attempts. Please try again later.",
  "retryAfter": 45
}
```

---

### Products

#### GET /api/products
Get all products.

**Public:** Yes  
**Rate Limit:** None

**Response (200):**
```json
[
  {
    "id": "mug-11oz",
    "name": "Classic Mug 11oz",
    "slug": "classic-mug-11oz",
    "description": "Perfect for daily coffee",
    "basePrice": 12.99,
    "images": {
      "thumbnail": "https://...",
      "gallery": ["https://..."]
    },
    "inStock": true,
    "rating": 4.8,
    "reviewCount": 127
  }
]
```

---

#### POST /api/products
Create a new product (Admin only).

**Authentication:** Required  
**Rate Limit:** 10 req/min

**Request:**
```json
{
  "name": "New Mug",
  "description": "A new awesome mug",
  "category": "mug",
  "basePrice": 14.99,
  "inStock": true
}
```

**Validation:**
- `name`: 1-100 characters
- `description`: 10-500 characters
- `category`: One of: mug, travel-mug, camping-mug, other
- `basePrice`: Positive number

**Response (201):**
```json
{
  "id": "new-mug-xyz",
  "name": "New Mug",
  "slug": "new-mug",
  ...
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

**Response (400):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "basePrice",
      "message": "Expected number, received string",
      "code": "invalid_type"
    }
  ]
}
```

---

#### PUT /api/products/[id]
Update a product (Admin only).

**Authentication:** Required  
**Rate Limit:** 20 req/min

**Request:** Same as POST

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

---

#### DELETE /api/products/[id]
Delete a product (Admin only).

**Authentication:** Required  
**Rate Limit:** 20 req/min

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### Orders

#### POST /api/track-order
Track an order by order number and email.

**Public:** Yes  
**Rate Limit:** 10 req/min (prevents order enumeration)

**Request:**
```json
{
  "orderNumber": "ORD-12345678",
  "email": "customer@example.com"
}
```

**Validation:**
- `orderNumber`: Required, non-empty
- `email`: Valid email format

**Response (200):**
```json
{
  "success": true,
  "order": {
    "order_number": "ORD-12345678",
    "status": "paid",
    "created_at": "2024-12-22T10:30:00Z",
    "shipping_info": {
      "city": "Madrid",
      "country": "Spain"
    },
    "items": [
      {
        "name": "Classic Mug 11oz",
        "quantity": 2,
        "variant": "Black"
      }
    ]
  }
}
```

**Response (404):**
```json
{
  "error": "Order not found or email does not match."
}
```

**Note:** Returns same error for both "not found" and "wrong email" to prevent order number enumeration.

---

### Payment

#### POST /api/create-payment-intent
Create a Stripe payment intent for checkout.

**Public:** Yes  
**Rate Limit:** Yes (configured in Stripe)

**Request:**
```json
{
  "items": [
    {
      "productId": "mug-11oz",
      "quantity": 2,
      "selectedVariant": {
        "id": "black",
        "name": "Black"
      }
    }
  ],
  "shippingInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+34666777888",
    "address": "123 Main St",
    "city": "Madrid",
    "postalCode": "28001",
    "country": "Spain"
  },
  "shippingMethod": "standard",
  "userId": "optional-user-id"
}
```

**Validation:**
- `items`: Array with at least 1 item
- `quantity`: 1-99 per item
- `shippingMethod`: One of: standard, express, overnight
- All shipping fields required with min/max lengths

**Response (200):**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "dpmCheckerLink": "https://dashboard.stripe.com/..."
}
```

**Security Notes:**
- Prices are validated server-side against product catalog
- Payment amount is calculated server-side
- Never trust client-provided prices

---

#### POST /api/stripe/webhooks
Stripe webhook handler (Stripe only).

**Authentication:** Stripe signature verification  
**Rate Limit:** None

**Headers Required:**
```
stripe-signature: t=xxx,v1=xxx
```

**Events Handled:**
- `payment_intent.succeeded` - Updates order to "paid"
- `payment_intent.payment_failed` - Updates order to "failed"
- `charge.refunded` - Logs refund
- `charge.dispute.created` - Logs dispute

**Response (200):**
```json
{
  "received": true,
  "eventType": "payment_intent.succeeded",
  "eventId": "evt_xxx"
}
```

---

## Security

### XSS Protection
All user inputs are sanitized using dedicated sanitization utilities:
- HTML content: Stripped of malicious scripts
- Text inputs: HTML tags removed
- URLs: javascript: and data: URIs blocked

### CSRF Protection
- Recommended: Use `@edge-csrf/nextjs` for production
- Current: CSP headers configured

### SQL Injection
- Protected: All queries use Supabase ORM
- No raw SQL queries exposed to user input

---

## Examples

### Complete Checkout Flow

```javascript
// 1. Add items to cart (client-side)
const cart = {
  items: [
    { productId: 'mug-11oz', quantity: 2 }
  ]
};

// 2. Create payment intent
const response = await fetch('/api/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: cart.items,
    shippingInfo: userShippingInfo,
    shippingMethod: 'standard'
  })
});

const { clientSecret } = await response.json();

// 3. Confirm payment with Stripe
const { error } = await stripe.confirmPayment({
  clientSecret,
  confirmParams: {
    return_url: 'https://mugmagic.com/checkout/success'
  }
});
```

### Track Order

```javascript
const response = await fetch('/api/track-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderNumber: 'ORD-12345678',
    email: 'customer@example.com'
  })
});

const { order } = await response.json();
console.log('Order status:', order.status);
```

---

## Changelog

### v1.0 (2024-12-22)
- Initial API documentation
- Added rate limiting to all endpoints
- Zod validation on 75% of endpoints
- XSS sanitization implemented
- Authentication on admin endpoints

---

**Support:** For API issues, contact support@mugmagic.com
