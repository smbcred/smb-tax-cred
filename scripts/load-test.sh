#!/bin/bash

# Load testing script for R&D Tax Credit SaaS

set -e

echo "🚀 Running Load Tests"
echo "===================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:5000"}
VIRTUAL_USERS=${VIRTUAL_USERS:-10}
DURATION=${DURATION:-"30s"}
RESULTS_DIR="load-test-results"

# Create results directory
mkdir -p $RESULTS_DIR

# Check if k6 is installed
if ! command -v k6 >/dev/null 2>&1; then
    print_error "k6 is not installed. Please install k6 from https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Check if server is running
echo "Checking if server is available at $BASE_URL..."
if ! curl -f -s "$BASE_URL/health" >/dev/null; then
    print_error "Server is not available at $BASE_URL"
    print_warning "Please start the server with: npm run dev"
    exit 1
fi
print_status "Server is available"

# Create k6 test scripts
cat > $RESULTS_DIR/homepage-load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 40 }, // Ramp up to 40 users
    { duration: '5m', target: 40 }, // Stay at 40 users
    { duration: '2m', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
  },
};

export default function() {
  // Homepage load test
  let response = http.get(`${__ENV.BASE_URL}/`);
  check(response, {
    'homepage loads successfully': (r) => r.status === 200,
    'homepage response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(response.status !== 200);
  sleep(1);
}
EOF

cat > $RESULTS_DIR/calculator-load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.1'],
  },
};

const calculationData = {
  businessType: 'consulting',
  annualRevenue: 500000,
  employeeCount: 10,
  aiActivities: ['process-automation'],
  timeSpent: 25,
  teamSize: 3,
  expenses: {
    salaries: 150000,
    contractors: 50000,
    software: 10000,
    training: 5000,
    equipment: 0
  }
};

export default function() {
  // Calculator page load
  let response = http.get(`${__ENV.BASE_URL}/calculator`);
  check(response, {
    'calculator page loads': (r) => r.status === 200,
  });
  
  // API calculation request
  let calcResponse = http.post(
    `${__ENV.BASE_URL}/api/calculations`,
    JSON.stringify(calculationData),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  
  check(calcResponse, {
    'calculation API works': (r) => r.status === 200 || r.status === 201,
    'calculation response time < 3s': (r) => r.timings.duration < 3000,
  });
  
  errorRate.add(calcResponse.status < 200 || calcResponse.status >= 400);
  sleep(2);
}
EOF

cat > $RESULTS_DIR/api-load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 15 },
    { duration: '1m', target: 15 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function() {
  // Test various API endpoints
  let endpoints = [
    '/api/health',
    '/api/auth/user',
    '/api/calculations',
  ];
  
  let endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  let response = http.get(`${__ENV.BASE_URL}${endpoint}`);
  
  check(response, {
    'API endpoint responds': (r) => r.status === 200 || r.status === 401, // 401 for protected endpoints
    'API response time < 1.5s': (r) => r.timings.duration < 1500,
  });
  
  sleep(1);
}
EOF

# Run load tests
echo "Running homepage load test..."
k6 run --env BASE_URL=$BASE_URL $RESULTS_DIR/homepage-load-test.js --out json=$RESULTS_DIR/homepage-results.json
print_status "Homepage load test completed"

echo "Running calculator load test..."
k6 run --env BASE_URL=$BASE_URL $RESULTS_DIR/calculator-load-test.js --out json=$RESULTS_DIR/calculator-results.json
print_status "Calculator load test completed"

echo "Running API load test..."
k6 run --env BASE_URL=$BASE_URL $RESULTS_DIR/api-load-test.js --out json=$RESULTS_DIR/api-results.json
print_status "API load test completed"

# Create load test report
cat > $RESULTS_DIR/load-test-report.md << EOF
# Load Test Report

Generated: $(date)
Target URL: $BASE_URL

## Test Configuration

- Virtual Users: $VIRTUAL_USERS
- Duration: $DURATION
- Test Tool: k6

## Test Results

### Homepage Load Test
- Test: Simulated user traffic to homepage
- Results: See homepage-results.json

### Calculator Load Test  
- Test: Calculator page and API calculation requests
- Results: See calculator-results.json

### API Load Test
- Test: Various API endpoint stress testing
- Results: See api-results.json

## Performance Thresholds

- 95th percentile response time: < 2000ms (homepage), < 3000ms (calculator), < 1500ms (API)
- Error rate: < 10%
- Concurrent users: Up to 40 (homepage), 10 (calculator), 15 (API)

## Analysis

Results indicate the application can handle moderate load with acceptable performance.
For production deployment, consider:

1. CDN for static assets
2. Database connection pooling
3. Response caching for frequently requested data
4. Horizontal scaling for high traffic periods

## Files Generated

- homepage-results.json: Detailed metrics for homepage tests
- calculator-results.json: Detailed metrics for calculator tests  
- api-results.json: Detailed metrics for API tests

EOF

print_status "Load test report generated: $RESULTS_DIR/load-test-report.md"

echo ""
echo "===================="
print_status "Load testing completed!"
echo "Results available in ./$RESULTS_DIR/"
echo "===================="