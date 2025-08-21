# Multi-Cab Financial Tracker

A comprehensive React.js and Firebase-based application for managing multiple cabs with advanced financial tracking, location monitoring, and real-time analytics.

## 🚀 Features

### Core Features
- **Multi-Cab Management**: Add, edit, and manage multiple cabs with driver information
- **Real-time Trip Tracking**: Track trips from start to completion with fare calculation
- **Expense Management**: Monitor fuel, maintenance, insurance, and other operational costs
- **Location Tracking**: Real-time GPS tracking of all cabs (map integration ready)
- **Financial Analytics**: Comprehensive reports and insights with charts and graphs
- **User Authentication**: Secure login and registration system

### Advanced Features
- **Real-time Updates**: Live data synchronization across all devices
- **Responsive Design**: Modern UI that works on desktop, tablet, and mobile
- **Advanced Analytics**: Revenue tracking, expense breakdown, and profit analysis
- **Export Capabilities**: Generate and export financial reports
- **Notification System**: Real-time alerts and notifications
- **Multi-currency Support**: Support for different currencies
- **Timezone Support**: Global timezone handling

## 🛠️ Technology Stack

- **Frontend**: React.js 18 with Hooks
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Styling**: Tailwind CSS with custom components
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with validation
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Multi-Cab-Financial-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Storage (optional)
   - Get your Firebase config

4. **Configure Firebase**
   - Open `src/firebase/config.js`
   - Replace the placeholder config with your actual Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── cabs/          # Cab management
│   ├── dashboard/     # Main dashboard
│   ├── expenses/      # Expense tracking
│   ├── layout/        # Layout components
│   ├── reports/       # Analytics and reports
│   ├── settings/      # User settings
│   ├── tracking/      # Location tracking
│   └── trips/         # Trip management
├── contexts/          # React contexts
├── firebase/          # Firebase configuration
├── services/          # API services
└── index.css          # Global styles
```

## 🔧 Configuration

### Firebase Security Rules

Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Cab data
    match /cabs/{cabId} {
      allow read, write: if request.auth != null;
    }
    
    // Trip data
    match /trips/{tripId} {
      allow read, write: if request.auth != null;
    }
    
    // Expense data
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## 📊 Features Overview

### Dashboard
- Real-time statistics and metrics
- Quick action buttons
- Recent activity feed
- Earnings and expense charts

### Cab Management
- Add new cabs with complete details
- Edit cab information
- Track cab status (active, maintenance, inactive)
- Driver information management

### Trip Management
- Start new trips
- Track trip progress
- Complete trips with fare calculation
- Trip history and analytics

### Expense Tracking
- Categorize expenses (fuel, maintenance, insurance, etc.)
- Receipt management
- Expense analytics and reporting

### Location Tracking
- Real-time GPS tracking
- Cab status monitoring
- Location history
- Interactive map integration (ready for implementation)

### Reports & Analytics
- Financial reports
- Revenue analysis
- Expense breakdown
- Performance metrics
- Export capabilities

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```

4. Deploy:
   ```bash
   firebase deploy
   ```

## 🔒 Security Features

- User authentication with Firebase Auth
- Secure data access with Firestore rules
- Input validation and sanitization
- Protected routes and components
- Secure API endpoints

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔧 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for global styles
- Customize component styles in individual files

### Features
- Add new cab types in `cabService.js`
- Extend expense categories in `expenseService.js`
- Add new report types in `Reports.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Map Integration**: Google Maps or Mapbox integration
- **Push Notifications**: Real-time push notifications
- **Offline Support**: PWA capabilities
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: React Native version
- **API Integration**: Third-party service integrations
- **Advanced Reporting**: Custom report builder

## 📈 Performance

- Optimized React components
- Efficient Firebase queries
- Lazy loading for better performance
- Cached data for offline access
- Optimized bundle size

---

**Built with ❤️ using React.js and Firebase** 