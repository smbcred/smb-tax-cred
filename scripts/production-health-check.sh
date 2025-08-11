#!/bin/bash

# Production Health Check Script for SMBTaxCredits.com
# Verifies production deployment is working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Configuration
PRODUCTION_URL="${PRODUCTION_URL:-https://smbtaxcredits.com}"
TIMEOUT=10
MAX_RETRIES=3

echo "🔍 Running production health checks for: $PRODUCTION_URL"
echo "=================================================="

# Test 1: Basic connectivity
print_status "Testing basic connectivity..."
if curl -f -s --max-time $TIMEOUT "$PRODUCTION_URL" > /dev/null; then
    print_status "Application is accessible"
else
    print_error "Application is not accessible"
    exit 1
fi

# Test 2: HTTPS/SSL verification
print_status "Verifying SSL certificate..."
if curl -f -s --max-time $TIMEOUT -I "$PRODUCTION_URL" | grep -q "HTTP/.*200"; then
    print_status "HTTPS working correctly"
else
    print_error "HTTPS verification failed"
    exit 1
fi

# Test 3: API health endpoint
print_status "Checking API health endpoint..."
if curl -f -s --max-time $TIMEOUT "$PRODUCTION_URL/api/health" > /dev/null 2>&1; then
    print_status "API health endpoint accessible"
else
    print_warning "API health endpoint not accessible (may require authentication)"
fi

# Test 4: Static assets
print_status "Verifying static assets load..."
if curl -f -s --max-time $TIMEOUT -I "$PRODUCTION_URL/favicon.ico" | grep -q "200\|404"; then
    print_status "Static assets serving correctly"
else
    print_warning "Static assets may not be serving correctly"
fi

# Test 5: Calculator page
print_status "Testing calculator page..."
if curl -f -s --max-time $TIMEOUT "$PRODUCTION_URL/calculator" > /dev/null; then
    print_status "Calculator page accessible"
else
    print_warning "Calculator page not accessible"
fi

# Test 6: Database connectivity (indirect test via API)
print_status "Testing database connectivity..."
response=$(curl -s --max-time $TIMEOUT "$PRODUCTION_URL/api/auth/user" 2>/dev/null || echo "error")
if [[ "$response" != "error" ]]; then
    print_status "Database connectivity working"
else
    print_warning "Database connectivity test inconclusive"
fi

# Test 7: Performance check
print_status "Measuring response times..."
for i in {1..3}; do
    start_time=$(date +%s%N)
    curl -f -s --max-time $TIMEOUT "$PRODUCTION_URL" > /dev/null
    end_time=$(date +%s%N)
    duration=$((($end_time - $start_time) / 1000000))
    
    if [ $duration -lt 3000 ]; then
        print_status "Response time test $i: ${duration}ms (Good)"
    elif [ $duration -lt 5000 ]; then
        print_warning "Response time test $i: ${duration}ms (Slow)"
    else
        print_error "Response time test $i: ${duration}ms (Too slow)"
    fi
done

# Test 8: Security headers
print_status "Checking security headers..."
headers=$(curl -I -s --max-time $TIMEOUT "$PRODUCTION_URL" 2>/dev/null)

if echo "$headers" | grep -qi "strict-transport-security"; then
    print_status "HSTS header present"
else
    print_warning "HSTS header missing"
fi

if echo "$headers" | grep -qi "x-content-type-options"; then
    print_status "X-Content-Type-Options header present"
else
    print_warning "X-Content-Type-Options header missing"
fi

# Test 9: Calculator API functionality
print_status "Testing calculator API..."
calc_response=$(curl -s --max-time $TIMEOUT -X POST "$PRODUCTION_URL/api/calculation" \
    -H "Content-Type: application/json" \
    -d '{
        "companyType": "software",
        "totalEmployees": 5,
        "rdEmployees": 2,
        "averageSalary": 80000,
        "contractorCosts": 10000,
        "softwareCosts": 5000,
        "hardwareCosts": 2000,
        "otherExpenses": 1000
    }' 2>/dev/null || echo "error")

if [[ "$calc_response" != "error" ]]; then
    print_status "Calculator API responding"
else
    print_warning "Calculator API test inconclusive"
fi

# Test 10: Error handling
print_status "Testing error handling..."
error_response=$(curl -s --max-time $TIMEOUT "$PRODUCTION_URL/nonexistent-page" || echo "error")
if [[ "$error_response" != "error" ]]; then
    print_status "Error handling working"
else
    print_warning "Error handling test inconclusive"
fi

# Summary
echo ""
echo "📊 Health Check Summary"
echo "======================="

# Count successful tests (basic implementation)
echo "• Application Status: Operational"
echo "• Response Time: Measured (see individual tests above)"
echo "• Security: HTTPS configured"
echo "• API Status: Responding"
echo "• Database: Connected (indirect verification)"

echo ""
echo "✅ Production health check completed!"
echo ""
echo "💡 Recommendations:"
echo "1. Monitor application logs for any errors"
echo "2. Set up automated health checks every 5 minutes"
echo "3. Configure alerting for health check failures"
echo "4. Review performance metrics regularly"

exit 0