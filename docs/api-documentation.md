# API Documentation
## Portfolio Management Web Application

**Version:** 1.0  
**Base URL:** Firebase Cloud Functions  
**Authentication:** Firebase Authentication (Bearer Token)

---

## Table of Contents
1. [Authentication](#authentication)
2. [Portfolio Endpoints](#portfolio-endpoints)
3. [Transaction Endpoints](#transaction-endpoints)
4. [Analytics Endpoints](#analytics-endpoints)
5. [Settings Endpoints](#settings-endpoints)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Authentication

All API requests (except registration and login) require authentication using Firebase ID tokens.

### Request Headers

```http
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

### Getting ID Token

```typescript
import { auth } from './firebase';

const user = auth.currentUser;
if (user) {
  const token = await user.getIdToken();
  // Use token in Authorization header
}
```

---

## Portfolio Endpoints

### Get All Portfolios

Retrieve all portfolios for the authenticated user.

**Endpoint:** `GET /api/portfolios`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "portfolioId": "port_123456",
      "userId": "user_abc123",
      "name": "My Investment Portfolio",
      "description": "Primary investment portfolio",
      "totalValue": 500000,
      "currency": "THB",
      "investmentTypes": {
        "cooperative": {
          "count": 12,
          "totalValue": 50000
        },
        "pvd": {
          "count": 24,
          "totalValue": 150000
        },
        "mutualFund": {
          "count": 8,
          "totalValue": 200000
        },
        "stock": {
          "count": 5,
          "totalValue": 80000
        },
        "savings": {
          "count": 12,
          "totalValue": 20000
        }
      },
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-11-29T12:00:00Z"
    }
  ],
  "message": "Portfolios retrieved successfully",
  "timestamp": "2025-11-29T12:00:00Z"
}
```

---

### Get Portfolio by ID

Retrieve a specific portfolio with detailed information.

**Endpoint:** `GET /api/portfolios/:portfolioId`

**Parameters:**
- `portfolioId` (string, required) - Portfolio ID

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolioId": "port_123456",
    "userId": "user_abc123",
    "name": "My Investment Portfolio",
    "description": "Primary investment portfolio",
    "totalValue": 500000,
    "currency": "THB",
    "investmentTypes": {
      "cooperative": {
        "count": 12,
        "totalValue": 50000,
        "percentage": 10
      },
      "pvd": {
        "count": 24,
        "totalValue": 150000,
        "percentage": 30
      },
      "mutualFund": {
        "count": 8,
        "totalValue": 200000,
        "percentage": 40
      },
      "stock": {
        "count": 5,
        "totalValue": 80000,
        "percentage": 16
      },
      "savings": {
        "count": 12,
        "totalValue": 20000,
        "percentage": 4
      }
    },
    "performance": {
      "totalInvested": 450000,
      "totalReturn": 50000,
      "returnPercentage": 11.11
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-11-29T12:00:00Z"
  }
}
```

---

### Create Portfolio

Create a new portfolio.

**Endpoint:** `POST /api/portfolios`

**Request Body:**
```json
{
  "name": "New Portfolio",
  "description": "My second portfolio",
  "currency": "THB"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolioId": "port_789012",
    "userId": "user_abc123",
    "name": "New Portfolio",
    "description": "My second portfolio",
    "totalValue": 0,
    "currency": "THB",
    "createdAt": "2025-11-29T12:00:00Z"
  },
  "message": "Portfolio created successfully"
}
```

---

### Update Portfolio

Update an existing portfolio.

**Endpoint:** `PUT /api/portfolios/:portfolioId`

**Request Body:**
```json
{
  "name": "Updated Portfolio Name",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolioId": "port_123456",
    "name": "Updated Portfolio Name",
    "description": "Updated description",
    "updatedAt": "2025-11-29T12:00:00Z"
  },
  "message": "Portfolio updated successfully"
}
```

---

### Delete Portfolio

Delete a portfolio and all associated transactions.

**Endpoint:** `DELETE /api/portfolios/:portfolioId`

**Response:**
```json
{
  "success": true,
  "message": "Portfolio deleted successfully",
  "timestamp": "2025-11-29T12:00:00Z"
}
```

---

## Transaction Endpoints

### Get All Transactions

Retrieve transactions with optional filtering.

**Endpoint:** `GET /api/transactions`

**Query Parameters:**
- `portfolioId` (string, optional) - Filter by portfolio
- `type` (string, optional) - Filter by type (cooperative, pvd, mutualFund, stock, savings)
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)
- `limit` (number, optional) - Limit results (default: 50, max: 100)
- `offset` (number, optional) - Offset for pagination (default: 0)

**Example:** `GET /api/transactions?portfolioId=port_123456&type=mutualFund&limit=20`

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transactionId": "txn_001",
        "userId": "user_abc123",
        "portfolioId": "port_123456",
        "type": "mutualFund",
        "date": "2025-11-15T00:00:00Z",
        "amount": 10000,
        "currency": "THB",
        "details": {
          "fundName": "SCBS&P500",
          "installmentNumber": 5,
          "unitsPurchased": 25.5,
          "pricePerUnit": 392.16,
          "totalUnits": 127.5,
          "currentValue": 11500
        },
        "createdAt": "2025-11-15T10:30:00Z",
        "updatedAt": "2025-11-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### Get Transaction by ID

Retrieve a specific transaction.

**Endpoint:** `GET /api/transactions/:transactionId`

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_001",
    "userId": "user_abc123",
    "portfolioId": "port_123456",
    "type": "stock",
    "date": "2025-11-01T00:00:00Z",
    "amount": 15000,
    "currency": "USD",
    "details": {
      "stockName": "Apple Inc.",
      "ticker": "AAPL",
      "installmentNumber": 3,
      "unitsPurchased": 10,
      "pricePerUnit": 175.50,
      "exchangeRate": 35.20,
      "purchaseValueTHB": 61776,
      "totalInvestment": 185328
    },
    "notes": "Regular monthly investment",
    "createdAt": "2025-11-01T08:00:00Z",
    "updatedAt": "2025-11-01T08:00:00Z"
  }
}
```

---

### Create Transaction

Add a new transaction.

**Endpoint:** `POST /api/transactions`

**Request Body (Mutual Fund):**
```json
{
  "portfolioId": "port_123456",
  "type": "mutualFund",
  "date": "2025-11-29T00:00:00Z",
  "amount": 10000,
  "currency": "THB",
  "details": {
    "fundName": "SCBS&P500",
    "installmentNumber": 6,
    "unitsPurchased": 25.0,
    "pricePerUnit": 400.00
  },
  "notes": "Monthly investment"
}
```

**Request Body (Stock):**
```json
{
  "portfolioId": "port_123456",
  "type": "stock",
  "date": "2025-11-29T00:00:00Z",
  "amount": 1755,
  "currency": "USD",
  "details": {
    "stockName": "Apple Inc.",
    "ticker": "AAPL",
    "installmentNumber": 4,
    "unitsPurchased": 10,
    "pricePerUnit": 175.50,
    "exchangeRate": 35.20
  }
}
```

**Request Body (Cooperative):**
```json
{
  "portfolioId": "port_123456",
  "type": "cooperative",
  "date": "2025-11-29T00:00:00Z",
  "amount": 5000,
  "currency": "THB",
  "details": {
    "year": 2025,
    "period": 11,
    "month": "November"
  }
}
```

**Request Body (PVD):**
```json
{
  "portfolioId": "port_123456",
  "type": "pvd",
  "date": "2025-11-29T00:00:00Z",
  "amount": 8000,
  "currency": "THB",
  "details": {
    "year": 2025,
    "period": 11,
    "month": "November",
    "employeeContribution": 5000,
    "employerContribution": 3000,
    "contributionPercentage": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_new123",
    "portfolioId": "port_123456",
    "type": "mutualFund",
    "amount": 10000,
    "createdAt": "2025-11-29T12:00:00Z"
  },
  "message": "Transaction created successfully"
}
```

---

### Update Transaction

Update an existing transaction.

**Endpoint:** `PUT /api/transactions/:transactionId`

**Request Body:**
```json
{
  "amount": 12000,
  "details": {
    "unitsPurchased": 30.0,
    "pricePerUnit": 400.00
  },
  "notes": "Updated investment amount"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_001",
    "amount": 12000,
    "updatedAt": "2025-11-29T12:00:00Z"
  },
  "message": "Transaction updated successfully"
}
```

---

### Delete Transaction

Delete a transaction.

**Endpoint:** `DELETE /api/transactions/:transactionId`

**Response:**
```json
{
  "success": true,
  "message": "Transaction deleted successfully",
  "timestamp": "2025-11-29T12:00:00Z"
}
```

---

### Bulk Import Transactions

Import multiple transactions at once.

**Endpoint:** `POST /api/transactions/bulk`

**Request Body:**
```json
{
  "portfolioId": "port_123456",
  "transactions": [
    {
      "type": "mutualFund",
      "date": "2025-11-01T00:00:00Z",
      "amount": 10000,
      "currency": "THB",
      "details": {
        "fundName": "SCBS&P500",
        "unitsPurchased": 25.0,
        "pricePerUnit": 400.00
      }
    },
    {
      "type": "cooperative",
      "date": "2025-11-01T00:00:00Z",
      "amount": 5000,
      "currency": "THB",
      "details": {
        "year": 2025,
        "period": 11,
        "month": "November"
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 2,
    "failed": 0,
    "transactions": [
      {
        "transactionId": "txn_bulk001",
        "status": "success"
      },
      {
        "transactionId": "txn_bulk002",
        "status": "success"
      }
    ]
  },
  "message": "2 transactions imported successfully"
}
```

---

## Analytics Endpoints

### Get Performance Metrics

Retrieve portfolio performance metrics.

**Endpoint:** `GET /api/analytics/performance`

**Query Parameters:**
- `portfolioId` (string, required) - Portfolio ID
- `period` (string, optional) - Time period (daily, weekly, monthly, yearly, all)
- `startDate` (string, optional) - Start date
- `endDate` (string, optional) - End date

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolioId": "port_123456",
    "period": "monthly",
    "totalValue": 500000,
    "totalInvested": 450000,
    "totalReturn": 50000,
    "returnPercentage": 11.11,
    "byType": {
      "cooperative": {
        "invested": 48000,
        "currentValue": 50000,
        "return": 2000,
        "returnPercentage": 4.17
      },
      "pvd": {
        "invested": 140000,
        "currentValue": 150000,
        "return": 10000,
        "returnPercentage": 7.14
      },
      "mutualFund": {
        "invested": 180000,
        "currentValue": 200000,
        "return": 20000,
        "returnPercentage": 11.11
      },
      "stock": {
        "invested": 70000,
        "currentValue": 80000,
        "return": 10000,
        "returnPercentage": 14.29
      },
      "savings": {
        "invested": 12000,
        "currentValue": 20000,
        "return": 8000,
        "returnPercentage": 66.67
      }
    },
    "timeline": [
      {
        "date": "2025-11-01",
        "value": 480000
      },
      {
        "date": "2025-11-15",
        "value": 490000
      },
      {
        "date": "2025-11-29",
        "value": 500000
      }
    ]
  }
}
```

---

### Get Portfolio Distribution

Get allocation distribution across investment types.

**Endpoint:** `GET /api/analytics/distribution`

**Query Parameters:**
- `portfolioId` (string, required) - Portfolio ID

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolioId": "port_123456",
    "totalValue": 500000,
    "distribution": [
      {
        "type": "mutualFund",
        "value": 200000,
        "percentage": 40,
        "color": "#3B82F6"
      },
      {
        "type": "pvd",
        "value": 150000,
        "percentage": 30,
        "color": "#10B981"
      },
      {
        "type": "stock",
        "value": 80000,
        "percentage": 16,
        "color": "#F59E0B"
      },
      {
        "type": "cooperative",
        "value": 50000,
        "percentage": 10,
        "color": "#8B5CF6"
      },
      {
        "type": "savings",
        "value": 20000,
        "percentage": 4,
        "color": "#EC4899"
      }
    ]
  }
}
```

---

### Get Trend Analysis

Analyze investment trends over time.

**Endpoint:** `GET /api/analytics/trends`

**Query Parameters:**
- `portfolioId` (string, required)
- `period` (string, required) - daily, weekly, monthly, yearly
- `type` (string, optional) - Investment type filter

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolioId": "port_123456",
    "period": "monthly",
    "trends": {
      "value": {
        "current": 500000,
        "previous": 480000,
        "change": 20000,
        "changePercentage": 4.17,
        "trend": "up"
      },
      "return": {
        "current": 11.11,
        "previous": 8.33,
        "change": 2.78,
        "trend": "up"
      },
      "contributions": {
        "current": 30000,
        "previous": 25000,
        "change": 5000,
        "changePercentage": 20,
        "trend": "up"
      }
    }
  }
}
```

---

## Settings Endpoints

### Get User Settings

**Endpoint:** `GET /api/settings`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_abc123",
    "preferences": {
      "currency": "THB",
      "dateFormat": "DD/MM/YYYY",
      "language": "en",
      "theme": "light",
      "notifications": {
        "email": true,
        "push": false
      }
    }
  }
}
```

---

### Update User Settings

**Endpoint:** `PUT /api/settings`

**Request Body:**
```json
{
  "preferences": {
    "currency": "THB",
    "language": "th",
    "theme": "dark"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "currency": "THB",
      "language": "th",
      "theme": "dark"
    }
  },
  "message": "Settings updated successfully"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "fieldName",
      "reason": "Specific reason for error"
    }
  },
  "timestamp": "2025-11-29T12:00:00Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required or token invalid |
| `FORBIDDEN` | 403 | User doesn't have permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Rate Limiting

**Limits:**
- 100 requests per minute per user
- 1000 requests per hour per user

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701259200
```

**Rate Limit Exceeded Response:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## Versioning

API version is included in the URL path:
- Current version: `/api/v1/`
- Legacy support: 6 months after new version release

---

**Last Updated:** November 29, 2025  
**API Version:** 1.0
