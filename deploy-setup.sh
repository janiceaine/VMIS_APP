#!/bin/bash

echo "🚀 Setting up VMIS for GitHub and deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Please run 'git init' first."
    exit 1
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit with a meaningful message
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Full-stack VMIS application

Features:
- ASP.NET Core backend with Entity Framework
- Vanilla JavaScript frontend with responsive design
- Docker Compose development environment
- Environment-aware configuration
- Ready for deployment to Netlify + Heroku/Railway

Built as a learning project transitioning from JavaScript to C# and ASP.NET Core."

echo "✅ Repository prepared for GitHub!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub: https://github.com/new"
echo "2. Name it something like: vmis-vehicle-management"
echo "3. Run these commands with your actual GitHub URL:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/vmis-vehicle-management.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Deploy frontend to Netlify: https://netlify.com"
echo "5. Deploy backend to Heroku/Railway/Azure"
echo "6. Update Frontend/config.js with your backend URL"
echo ""
echo "🎉 You're ready to deploy!"
