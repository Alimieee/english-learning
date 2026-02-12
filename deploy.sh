#!/bin/bash

# GitHub Deployment Script for English Learning Website
# This script will push your website to GitHub Pages

echo "🚀 English Learning Website - GitHub Deployment"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found!"
    echo "Please run this script from the english-learning-website directory"
    exit 1
fi

echo "✅ Found website files"
echo ""

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "📝 Adding all files to Git..."
git add .

echo ""
echo "💬 Creating commit..."
git commit -m "Initial commit: A1 English learning website with 4 modules"

echo ""
echo "🔗 Adding remote repository..."
git remote remove origin 2>/dev/null  # Remove if exists
git remote add origin https://github.com/Alimieee/english-learning.git

echo ""
echo "🌿 Setting default branch to main..."
git branch -M main

echo ""
echo "⬆️  Pushing to GitHub..."
echo "You may be asked for your GitHub username and Personal Access Token"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your website has been pushed to GitHub!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Go to: https://github.com/Alimieee/english-learning"
    echo "2. Click 'Settings' → 'Pages'"
    echo "3. Under 'Source', select 'main branch'"
    echo "4. Click 'Save'"
    echo ""
    echo "Your website will be live at:"
    echo "https://alimieee.github.io/english-learning/"
    echo ""
    echo "Share this link with your friend! 🎓"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "1. Authentication: Use Personal Access Token, not password"
    echo "2. Repository exists: Check if repo is already created on GitHub"
    echo ""
    echo "Need help? Check the walkthrough.md file"
fi
