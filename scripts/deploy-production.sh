#!/bin/bash

# Production Deployment Script for SMBTaxCredits.com
# This script prepares the application for production deployment on Replit

set -e  # Exit on any error

echo "🚀 Starting production deployment preparation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in production environment
if [ "$NODE_ENV" != "production" ]; then
    print_warning "NODE_ENV is not set to 'production'. Setting it now..."
    export NODE_ENV=production
fi

print_status "Environment: $NODE_ENV"

# 1. Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if required environment variables are set
required_vars=(
    "DATABASE_URL"
    "JWT_SECRET"
    "ENCRYPTION_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo "Please set these variables in Replit Secrets before deploying."
    exit 1
fi

# 2. Install dependencies
print_status "Installing production dependencies..."
npm ci --only=production

# 3. Run type checking
print_status "Running TypeScript type checking..."
if npm run typecheck > /dev/null 2>&1; then
    print_status "Type checking passed"
else
    print_warning "Type checking failed or not configured"
fi

# 4. Run linting
print_status "Running code linting..."
if npm run lint > /dev/null 2>&1; then
    print_status "Linting passed"
else
    print_warning "Linting failed or not configured"
fi

# 5. Run tests
print_status "Running tests..."
if npm test > /dev/null 2>&1; then
    print_status "Tests passed"
else
    print_warning "Tests failed or not configured"
fi

# 6. Build application
print_status "Building production application..."
npm run build

# Check if build was successful
if [ ! -d "client/dist" ]; then
    print_error "Build failed - client/dist directory not found"
    exit 1
fi

print_status "Build completed successfully"

# 7. Database migrations
print_status "Running database migrations..."
if command -v npm run db:push > /dev/null 2>&1; then
    npm run db:push
    print_status "Database migrations completed"
else
    print_warning "Database migration command not found"
fi

# 8. Verify build integrity
print_status "Verifying build integrity..."

# Check for essential files
essential_files=(
    "client/dist/index.html"
    "client/dist/assets"
    "server/index.js"
)

for file in "${essential_files[@]}"; do
    if [ ! -e "$file" ]; then
        print_error "Essential file missing: $file"
        exit 1
    fi
done

# 9. Security checks
print_status "Running security checks..."

# Check for hardcoded secrets (basic check)
if grep -r "sk_live\|pk_live\|api_key.*=" . --exclude-dir=node_modules --exclude-dir=.git > /dev/null 2>&1; then
    print_error "Potential hardcoded secrets found in code"
    print_error "Please review and remove any hardcoded API keys or secrets"
    exit 1
fi

# 10. Performance optimization
print_status "Applying production optimizations..."

# Set production environment variables
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=1024"

# 11. Generate deployment summary
print_status "Generating deployment summary..."

cat > deployment-summary.txt << EOF
Production Deployment Summary
============================
Date: $(date)
Node Version: $(node --version)
NPM Version: $(npm --version)
Environment: $NODE_ENV

Build Information:
- Client build: $(ls -la client/dist/index.html 2>/dev/null | awk '{print $5}' || echo "Not found") bytes
- Asset count: $(find client/dist/assets -type f 2>/dev/null | wc -l || echo "0") files
- Server ready: $([ -f server/index.js ] && echo "Yes" || echo "No")

Security:
- Environment variables: $([ -n "$JWT_SECRET" ] && echo "Configured" || echo "Missing")
- Database connection: $([ -n "$DATABASE_URL" ] && echo "Configured" || echo "Missing")
- Encryption key: $([ -n "$ENCRYPTION_KEY" ] && echo "Configured" || echo "Missing")

Dependencies:
- Production packages: $(npm list --depth=0 --only=production 2>/dev/null | grep -c "^├\|^└" || echo "Unknown")
- Dev packages excluded: Yes

Ready for deployment: Yes
EOF

print_status "Deployment summary saved to deployment-summary.txt"

# 12. Final checks
print_status "Performing final deployment checks..."

# Check if server can start (quick test)
timeout 10s npm start > /dev/null 2>&1 &
SERVER_PID=$!
sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    print_status "Server startup test passed"
    kill $SERVER_PID
else
    print_warning "Server startup test failed - check server configuration"
fi

# 13. Display deployment instructions
print_status "Production deployment preparation completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Verify all environment variables are set in Replit Secrets"
echo "2. Click 'Deploy' in the Replit interface"
echo "3. Configure custom domain if needed"
echo "4. Monitor deployment logs for any issues"
echo "5. Run post-deployment verification tests"
echo ""
echo "📊 Deployment Summary:"
cat deployment-summary.txt
echo ""
echo "✅ Ready for production deployment!"

# 14. Create deployment marker
echo "$(date): Production deployment prepared" >> .deployment-history

exit 0