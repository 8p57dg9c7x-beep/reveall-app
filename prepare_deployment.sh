#!/bin/bash

# REVEAL Backend Deployment Preparation Script
# This script verifies all files are ready for deployment

echo "=============================================="
echo "🚀 REVEAL Backend Deployment Preparation"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "/app/backend/server.py" ]; then
    echo -e "${RED}❌ ERROR: server.py not found in /app/backend/${NC}"
    exit 1
fi

cd /app/backend

echo "📋 Verification Checklist:"
echo ""

# 1. Check server.py exists and has content
echo -n "1. Checking server.py... "
if [ -f "server.py" ]; then
    LINES=$(wc -l < server.py)
    if [ $LINES -gt 1000 ]; then
        echo -e "${GREEN}✅ Found ($LINES lines)${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: server.py seems too small ($LINES lines)${NC}"
    fi
else
    echo -e "${RED}❌ MISSING${NC}"
    exit 1
fi

# 2. Check Dockerfile
echo -n "2. Checking Dockerfile... "
if [ -f "Dockerfile" ]; then
    echo -e "${GREEN}✅ Found${NC}"
else
    echo -e "${RED}❌ MISSING${NC}"
    exit 1
fi

# 3. Check requirements.txt
echo -n "3. Checking requirements.txt... "
if [ -f "requirements.txt" ]; then
    DEPS=$(wc -l < requirements.txt)
    echo -e "${GREEN}✅ Found ($DEPS dependencies)${NC}"
else
    echo -e "${RED}❌ MISSING${NC}"
    exit 1
fi

# 4. Check .dockerignore
echo -n "4. Checking .dockerignore... "
if [ -f ".dockerignore" ]; then
    echo -e "${GREEN}✅ Found${NC}"
else
    echo -e "${YELLOW}⚠️  Missing (recommended but not required)${NC}"
fi

# 5. Check data loading scripts
echo -n "5. Checking data loading scripts... "
if [ -f "load_real_outfits.py" ] && [ -f "load_beauty_looks.py" ]; then
    echo -e "${GREEN}✅ Found both scripts${NC}"
else
    echo -e "${YELLOW}⚠️  Missing (needed for data loading)${NC}"
fi

# 6. Verify critical routes exist in server.py
echo ""
echo "🔍 Verifying API Routes in server.py:"
echo ""

ROUTES_TO_CHECK=(
    "/outfits/trending"
    "/outfits/celebrity"
    "/beauty/{category}"
    "/discover/trending"
    "/lyrics/{query}"
)

MISSING_ROUTES=0

for route in "${ROUTES_TO_CHECK[@]}"; do
    echo -n "   Checking: $route... "
    if grep -q "$route" server.py; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ MISSING${NC}"
        MISSING_ROUTES=$((MISSING_ROUTES + 1))
    fi
done

if [ $MISSING_ROUTES -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ ERROR: $MISSING_ROUTES critical routes are missing!${NC}"
    echo "The server.py file may be outdated or incomplete."
    exit 1
fi

# 7. Check for .env file (should NOT be deployed)
echo ""
echo "🔒 Security Check:"
echo -n "   Checking for .env file... "
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  FOUND${NC}"
    echo "   ${YELLOW}⚠️  WARNING: .env file should NOT be pushed to GitHub!${NC}"
    echo "   ${YELLOW}⚠️  Add .env to .gitignore before pushing${NC}"
else
    echo -e "${GREEN}✅ Not found (good - use environment variables on Render)${NC}"
fi

# 8. Create .gitignore if it doesn't exist
echo ""
echo "📝 Checking .gitignore:"
if [ ! -f ".gitignore" ]; then
    echo "   Creating .gitignore file..."
    cat > .gitignore << 'EOF'
# Environment variables
.env
.env.local
.env.*.local

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Testing
.pytest_cache/
.coverage
htmlcov/
EOF
    echo -e "   ${GREEN}✅ Created .gitignore${NC}"
else
    echo -e "   ${GREEN}✅ .gitignore exists${NC}"
fi

# Summary
echo ""
echo "=============================================="
echo "📊 Deployment Readiness Summary"
echo "=============================================="
echo ""

if [ $MISSING_ROUTES -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Your backend code is ready for deployment!"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Initialize git repository (if not already done)"
    echo "   2. Add files to git: git add ."
    echo "   3. Commit: git commit -m 'Deploy REVEAL backend'"
    echo "   4. Push to GitHub: git push origin main"
    echo "   5. Configure Render to deploy from your repository"
    echo "   6. Add environment variables on Render dashboard"
    echo "   7. Deploy!"
    echo ""
else
    echo -e "${RED}❌ CHECKS FAILED!${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
    exit 1
fi

# Show git initialization commands
echo ""
echo "=============================================="
echo "🔧 Git Commands (if repository not initialized)"
echo "=============================================="
echo ""
echo "# Initialize repository"
echo "cd /app/backend"
echo "git init"
echo ""
echo "# Add remote (replace with your GitHub repo URL)"
echo "git remote add origin https://github.com/YOUR_USERNAME/reveal-backend.git"
echo ""
echo "# Stage all files"
echo "git add ."
echo ""
echo "# Commit"
echo 'git commit -m "Deploy complete REVEAL backend with all features"'
echo ""
echo "# Push to GitHub"
echo "git push -u origin main"
echo ""
echo "=============================================="
