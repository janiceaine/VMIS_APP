# 🚀 Render Deployment Guide for VMIS

## Why Render?
- **Free tier** with 750 hours/month
- **Automatic deployments** from GitHub
- **Built-in SSL** and custom domains
- **Environment variables** management
- **Excellent .NET support**
- **Integrated PostgreSQL** database

## Step-by-Step Deployment

### 1. Prepare Your Repository
```bash
# Make sure everything is committed
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub
- Connect your repository

### 3. Deploy Backend Web Service

**Create New Web Service:**
1. Dashboard → "New +" → "Web Service"
2. Connect your `vmis-vehicle-management` repository
3. Configure deployment:

**Service Configuration:**
```
Name: vmis-backend
Runtime: Native Environment (.NET)
Build Command: ./render-build.sh
Start Command: dotnet VehicleBackend.dll
```

**Important Settings:**
- **Root Directory**: Leave empty (deploy from repo root)
- **Branch**: main
- **Auto-Deploy**: Yes

**Environment Variables:**
```
ASPNETCORE_ENVIRONMENT=Production
JWT_SECRET=YourSecureJWTSecretKey123!
PORT=5000
ASPNETCORE_URLS=http://+:5000
```

### 4. Create PostgreSQL Database (Optional)
1. Dashboard → "New +" → "PostgreSQL"
2. Name: `vmis-database`
3. Copy the connection string
4. Add to backend environment variables:
   ```
   ConnectionStrings__DefaultConnection=<your-postgres-connection-string>
   ```

### 5. Update Frontend Configuration
After your backend is deployed, update `Frontend/config.js`:
```javascript
production: {
    API_BASE_URL: 'https://vmis-backend.onrender.com',
    // ... rest stays the same
}
```

### 6. Deploy Frontend to Netlify
1. Go to [netlify.com](https://netlify.com)
2. "New site from Git" → Connect your repository
3. Configure:
   - Build command: `echo 'Static site'`
   - Publish directory: `Frontend`
   - Branch: `main`

## Your Live URLs
- **Backend API**: `https://vmis-backend.onrender.com`
- **Frontend**: `https://your-site-name.netlify.app`
- **Database**: Managed by Render

## Testing Your Deployment

### Health Check
```bash
curl https://vmis-backend.onrender.com/api/health
```

### API Documentation
Visit: `https://vmis-backend.onrender.com/swagger`

### Frontend Test
Visit: `https://your-site-name.netlify.app/env-test.html`

## Troubleshooting

### Common Issues:
1. **Cold starts**: Render free tier sleeps after 15 minutes
2. **Build timeouts**: Increase build timeout in settings
3. **CORS errors**: Check allowed origins in Program.cs
4. **Database connection**: Verify connection string format

### Logs and Monitoring:
- View logs in Render dashboard
- Check "Events" tab for deployment status
- Monitor resource usage

## Cost Optimization
- **Free tier**: 750 hours/month per service
- **Paid tier**: $7/month for always-on services
- **Database**: Free PostgreSQL with 1GB storage

## Security Best Practices
- Use environment variables for secrets
- Enable HTTPS redirect
- Configure proper CORS origins
- Use strong JWT secrets
- Regularly update dependencies

---

🎉 **Your VMIS application is now live and production-ready!**
