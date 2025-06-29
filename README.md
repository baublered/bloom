# BloomTrack - Point of Sale System for Flower Shops

A comprehensive POS system designed specifically for flower shops, built with React frontend and Node.js backend.

## 🌺 Project Overview

BloomTrack is a modern point-of-sale system tailored for flower retail businesses. It provides separate interfaces for administrators and employees, with role-based access control and features specific to flower shop operations.

## 🏗️ Project Structure

```
bloomtrack/
├── pos-system/
│   ├── client/          # React frontend application
│   │   ├── src/
│   │   │   ├── pages/   # UI components and pages
│   │   │   ├── utils/   # Utility functions
│   │   │   └── components/
│   │   └── public/
│   └── server/          # Node.js backend
│       ├── controllers/ # API controllers
│       ├── models/      # Database models
│       ├── routes/      # Express routes
│       └── middleware/  # Custom middleware
└── README.md
```

## 🚀 Features

### 👥 Role-Based Access Control
- **Admin Dashboard**: Full system access including user management, reports, and maintenance
- **Employee Dashboard**: Limited access focused on sales transactions and inventory viewing

### 💰 Transaction Management
- **Retail Transactions**: Individual flower sales with cart functionality
- **Event Transactions**: Bulk orders for weddings, events, etc.
- **Percentage-based Discounts**: Flexible discount system (updated today)
- **Payment Processing**: Complete billing and payment workflow
- **Receipt Generation**: Automated receipt creation and printing

### 📦 Inventory Management
- **Stock Tracking**: Real-time inventory monitoring
- **Low Stock Alerts**: Automated notifications for low inventory
- **Seasonal Recommendations**: Metro Manila climate-based flower suggestions (added today)
- **Product Management**: Add, edit, and manage flower inventory

### 🔐 Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role Verification**: Server-side role checking
- **Protected Routes**: Route-level access control

## 📅 Recent Updates (June 30, 2025)

### ✅ Navigation System Improvements
- **Fixed double navigation bar issue** for employees
- **Implemented role-aware navigation** across all components
- **Centralized routing logic** for better consistency

### 🌸 Enhanced Seasonal Recommendations
- **Metro Manila climate-based flower suggestions**
- **Holiday-specific recommendations** (Valentine's Day, Mother's Day, etc.)
- **Color-coded notification system** with emoji indicators
- **Season-aware inventory suggestions**

### 💳 Billing System Updates
- **Replaced discount codes with percentage-based discounts** in retail transactions
- **Improved discount calculation** with real-time updates
- **Enhanced payment flow** consistency between retail and events

### 🔒 Access Control Enhancements
- **Restricted maintenance access** for employee roles
- **Removed admin-only features** from employee dashboard
- **Improved security** for sensitive operations (backup, product editing, restocking)

### 🐛 Bug Fixes
- **Fixed employee profile access** - employees can now view their profiles
- **Resolved transaction completion navigation** - proper redirection after receipts
- **Fixed role-based sidebar rendering** to prevent admin elements appearing for employees

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd pos-system/server
npm install
npm start
```

### Frontend Setup
```bash
cd pos-system/client
npm install
npm start
```

### Environment Variables
Create `.env` files in both client and server directories with appropriate configuration.

## 🎯 User Roles & Access

### Admin Features:
- ✅ User Registration & Management
- ✅ Product Registration & Editing
- ✅ Sales Reports & Analytics
- ✅ System Maintenance & Backup
- ✅ Inventory Restocking
- ✅ Full Transaction Access

### Employee Features:
- ✅ Retail & Event Transactions
- ✅ Inventory Viewing (read-only)
- ✅ Cart Management
- ✅ Payment Processing
- ✅ Receipt Generation
- ❌ User Management
- ❌ Product Editing
- ❌ System Maintenance
- ❌ Reports Access

## 🌍 Localization

The system is specifically designed for:
- **Location**: Metro Manila, Philippines
- **Currency**: Philippine Peso (₱)
- **Climate Considerations**: Tropical climate with wet/dry seasons
- **Local Holidays**: Philippine holidays and celebrations

## 💡 Technical Architecture

### Frontend (React)
- **State Management**: Local state with sessionStorage persistence
- **Routing**: React Router with role-based protection
- **Styling**: CSS modules with responsive design
- **Authentication**: JWT token handling

### Backend (Node.js/Express)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **API**: RESTful endpoints
- **Validation**: Input validation and sanitization

## 🤝 Contributing

This project was developed as a comprehensive POS solution for flower shops. The codebase follows React and Node.js best practices with emphasis on security and user experience.

## 📝 Development Notes

- **Last Updated**: June 30, 2025
- **Version**: 1.0.0
- **Status**: Production Ready
- **Contributors**: Development team focusing on small business POS solutions

## 🔧 Known Improvements Needed

Based on recent code review:
- [ ] Implement comprehensive input validation
- [ ] Add unit and integration tests
- [ ] Implement proper error boundaries
- [ ] Add TypeScript for type safety
- [ ] Optimize bundle size with code splitting
- [ ] Enhance mobile responsiveness
- [ ] Add comprehensive logging and monitoring

---

*BloomTrack - Making flower shop management bloom! 🌸*