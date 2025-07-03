# BloomTrack - Point of Sale System for Flower Shops

A comprehensive Product Management system designed specifically for flower shops, built with React frontend and Node.js backend.

## 👥 Development Team

**Course**: Software Engineering 2 (BSCS - 3rd year Summer)  
**Academic Year**: 2025  
**Institution**: TIP QC

### Developers:
1. **Developer 1**: Abogado, Jilliana 
2. **Developer 2**: Casero, Eljeanne 
3. **Developer 3**: Maloping, Alexine

**Status**: Not yet Defended

## 🌺 Project Overview

BloomTrack is a modern product management system tailored for flower retail businesses. It provides separate interfaces for administrators and employees, with role-based access control and features specific to flower shop operations. This project demonstrates full-stack web development principles, database design, security implementation, and user experience design as part of our Software Engineering course.

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
- **Retail Transactions**: Individual flower + Bouquet sales with cart functionality
- **Event Transactions**: Bulk orders for weddings, events, etc.
- **Percentage-based Discounts**: Flexible discount system (updated today)
- **Payment Processing**: Complete billing and payment workflow
- **Receipt Generation**: Automated receipt creation and printing

### 📦 Inventory Management
- **Stock Tracking**: Real-time inventory monitoring
- **Low Stock Alerts**: Automated notifications for low inventory
- **Seasonal Recommendations**: Metro Manila climate-based flower suggestions (added today)
- **Product Management**: Add, edit, and manage flower inventory

###  Advanced Reporting System
- **Sales Reports**: Comprehensive sales analytics with PDF/Excel export
- **Inventory Reports**: Stock level monitoring and low stock alerts  
- **Spoilage Reports**: Track expired/damaged products for loss management
- **Transaction History**: Detailed transaction logs with export capabilities
- **Print-friendly Layouts**: Clean printing without UI elements

### 🔔 Smart Notification System
- **Low Stock Alerts**: Real-time inventory monitoring with threshold alerts
- **Seasonal Recommendations**: Philippine climate-based flower suggestions
- **Holiday Reminders**: Automated suggestions for Valentine's Day, All Saints' Day, etc.
- **Visual Indicators**: Color-coded notifications with easy-to-read dropdown

### 🔐 Enhanced Security Features
- **RS256 JWT Authentication**: Industry-standard token-based security
- **Role-Based Access Control**: Admin vs Employee permission levels
- **Input Validation**: Server-side validation and sanitization
- **Protected Routes**: Route-level access control with middleware

## 📅 Latest Updates (July 3, 2025)

### 🌟 Major Feature Completions

#### ✅ Advanced Reporting System (COMPLETED)
- **PDF/Excel Export**: All reports now support both PDF and Excel export using xlsx library
- **Professional Print Layouts**: Clean print designs with no UI elements, proper headers/footers
- **Transaction History Export**: Scrollable transaction history with export capabilities in Reports page
- **Summary Analytics**: Revenue totals, transaction counts, and business insights

#### ✅ Enhanced Notification System (COMPLETED)  
- **Smart Notification Bell**: Restored in Inventory page with dropdown functionality
- **Accurate Seasonal Recommendations**: Updated with correct Philippine flower seasons:
  - **Dec-Feb**: Poinsettia, Anthurium, Chrysanthemums
  - **Mar-May**: Sampaguita, Bougainvillea, Ilang-Ilang
  - **Jun-Aug**: Gumamela (Hibiscus), Orchids  
  - **Sep-Nov**: Cosmos, Marigolds
- **Holiday-Specific Alerts**: All Saints' Day (Undas), Valentine's Day with culturally appropriate flowers
- **Low Stock Monitoring**: Real-time alerts for products below threshold

#### ✅ Security Documentation (COMPLETED)
- **RS256 Demonstration**: Created Security_Practice.js showing cryptographic implementation
- **Educational Security Examples**: JWT token creation, verification, and tampering detection
- **Best Practices Documentation**: Comprehensive security guidelines for production

#### ✅ UI/UX Polish (COMPLETED)
- **Dashboard Improvements**: Balanced card layouts, removed duplicate elements
- **Inventory Management**: FIFO sorting, priority indicators, visual status badges
- **Reports Interface**: Professional export modals, scrollable transaction tables
- **Responsive Design**: Clean layouts across all pages

### 🔧 Recent Technical Improvements

#### ✅ User Management System
- **Admin-Only Access**: Complete user registration and management for admins
- **Employee Restrictions**: Proper role-based UI hiding for employees
- **User Activity Logs**: Comprehensive logging system for security auditing

#### ✅ Events Management  
- **Flexible Event Deletion**: Ability to delete cancelled events with inventory restoration
- **Payment Status Tracking**: Clear status indicators and payment workflows
- **Inventory Integration**: Smart inventory deduction only on full payment

#### ✅ Navigation & Access Control
- **Fixed Double Navigation**: Resolved employee navigation bar duplication
- **Role-Aware Components**: Centralized role checking across all components  
- **Protected Route System**: Server and client-side route protection

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

##  Software Engineering Learning Outcomes

This project demonstrates mastery of key Software Engineering concepts:

### 📋 Project Management
- **V-Model Development**: Iterative feature development with regular updates
- **Version Control**: Git-based development with clear commit history
- **Documentation**: Comprehensive README and inline code documentation
- **Testing**: Manual testing procedures and validation workflows

### 🏗️ System Architecture & Design
- **MVC Pattern**: Clear separation of models, views, and controllers
- **RESTful API Design**: Standard HTTP methods and endpoint structure
- **Database Design**: Normalized MongoDB schema with proper relationships
- **Component-Based Architecture**: Reusable React components with clear interfaces

### 🔐 Security Implementation
- **Authentication & Authorization**: JWT-based security with role management
- **Data Validation**: Input sanitization and server-side validation
- **Secure Communication**: HTTPS-ready deployment configuration
- **Access Control**: Route-level and component-level permission systems

### 🎨 User Experience Design  
- **Responsive UI**: Mobile-friendly design principles
- **Accessibility**: Clear navigation and visual feedback systems
- **User-Centered Design**: Role-specific interfaces for different user types
- **Intuitive Workflows**: Streamlined business processes for flower shop operations

### 📊 Data Management
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Real-time Updates**: Live inventory tracking and notifications
- **Report Generation**: Business intelligence with export capabilities
- **Data Integrity**: Transaction consistency and inventory management

## 💼 Business Application

BloomTrack addresses real-world business needs for small flower shops:
- **Inventory Tracking**: Prevents stockouts and reduces waste
- **Sales Analytics**: Data-driven business decisions
- **Role Management**: Secure multi-user access control
- **Filipino Market Focus**: Localized for Philippine flower industry

## 💡 Technical Architecture

### Frontend (React)
- **State Management**: Local state with sessionStorage persistence
- **Routing**: React Router with role-based protection  
- **Styling**: CSS modules with responsive design
- **Authentication**: JWT token handling with automatic expiration
- **Export Functionality**: PDF generation and Excel export using xlsx

### Backend (Node.js/Express)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with RS256 encryption for enhanced security
- **API**: RESTful endpoints with proper HTTP status codes
- **Validation**: Input validation and sanitization middleware
- **File Handling**: Multer for image uploads and file management

### Security Implementation
- **Encryption**: RS256 asymmetric encryption for JWT tokens
- **Password Security**: Bcrypt hashing with salt rounds
- **Input Validation**: Server-side validation for all user inputs
- **Role-Based Access**: Middleware for route protection and user permissions

## 📝 Project Status

- **Last Updated**: July 3, 2025
- **Version**: 2.0.0 (Major Update)
- **Status**: Production Ready with Advanced Features
- **Course**: Software Engineering (BSCS)
- **Development Phase**: Complete with Documentation

## 🏆 Project Achievements

### ✅ Completed Features (100%)
- [x] User Authentication & Role Management
- [x] Inventory Management with FIFO and Smart Sorting
- [x] Transaction Processing (Retail & Events)
- [x] Advanced Reporting with PDF/Excel Export
- [x] Smart Notification System
- [x] Security Implementation (RS256 JWT)
- [x] Responsive UI/UX Design
- [x] Philippine Localization

### 📈 Technical Metrics
- **Frontend Components**: 15+ React components
- **Backend Endpoints**: 25+ RESTful API routes  
- **Database Models**: 8 MongoDB models
- **Security Features**: JWT, Bcrypt, Input validation
- **Export Formats**: PDF and Excel report generation
- **Code Quality**: Documented, commented, and tested


*BloomTrack - Making flower shop management bloom! 🌸*