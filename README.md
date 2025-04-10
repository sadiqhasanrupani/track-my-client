# Track My Client

A comprehensive client management solution designed for freelancers and agencies offering web and mobile development services. This platform streamlines client interactions, project tracking, and invoice management, featuring a modern dashboard for real-time monitoring of project statuses, payment tracking, and client engagement metrics. Built with Next.js, React, and Prisma, it offers a seamless experience for managing your development business, from initial client onboarding to final payment collection.

## Features

- User authentication and authorization
- Customer management (add, view, edit, delete)
- Invoice creation and tracking
- Dashboard with key metrics
- Mobile-responsive design

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Next.js API Routes
- Database: PostgreSQL with Prisma ORM
- Authentication: NextAuth.js

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
    Env Example
    ```env
    # Remember to create database named "invoice_management_db"
    DATABASE_URL="postgresql://username@hostname:port/invoice_management_db?sslmode=disable"

    # NextAuth.js Configuration
    NEXTAUTH_SECRET="secret"
    NEXTAUTH_URL="Client URL"
    ```
4. Run the development server: `npm run dev`

## How to Use

### User Authentication

#### Registration
1. Click on the "Register" button on the login page
2. Fill in the required fields:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
3. Upon successful registration, you'll be redirected to the login page
4. Verify your credentials to access the dashboard

#### Login
1. Enter your registered email and password
2. Click "Sign In"
3. If credentials are correct, you'll be directed to the dashboard
4. For forgotten passwords, use the "Forgot Password?" link to reset

### Dashboard Overview

#### Key Metrics
The dashboard displays important business metrics:
- Total Customers: Overall number of registered clients
- Total Invoices: Count of all generated invoices
- Total Revenue: Sum of all paid invoices
- Outstanding Invoices: Number of unpaid invoices

#### Revenue Analytics
- View monthly revenue trends through the interactive line chart
- Hover over data points to see detailed monthly figures
- Track revenue patterns and growth over time

#### Navigation
The sidebar provides quick access to:
- Dashboard: Main overview and metrics
- Customers: Customer management section
- Invoices: Invoice creation and tracking
- Settings: Account and application settings

### Customer Management

#### Viewing Customers
1. Click "Customers" in the sidebar
2. Browse the list of all customers
3. Use the search bar to filter customers by name or email
4. Sort customers by various fields (name, date added, etc.)

#### Adding New Customers
1. Click "Add Customer" button
2. Fill in customer details:
   - Name
   - Email
   - Phone Number
   - Address
3. Submit the form to add the customer
4. The customer list updates automatically

#### Editing Customer Details
1. Find the customer in the list
2. Click the "Edit" button
3. Modify the necessary information
4. Save changes to update the customer profile

#### Deleting Customers
1. Locate the customer to be removed
2. Click the "Delete" button
3. Confirm deletion in the popup dialog
4. Customer will be removed from the list

### Invoice Management

#### Creating Invoices
1. Navigate to the Invoices section
2. Click "Create Invoice"
3. Select a customer from the dropdown
4. Add invoice details:
   - Invoice items and amounts
   - Due date
   - Additional notes (optional)
5. Preview and confirm the invoice

#### Managing Invoice Status
- Track invoice status (Paid, Outstanding, Overdue)
- Filter invoices by status
- Update payment status when received
- View payment history and due dates

#### Notifications
- Receive alerts for overdue invoices
- Email notifications for payment status changes
- Dashboard highlights for outstanding payments
- Regular reminders for upcoming due dates

### Application Settings

#### Profile Management
1. Access Settings through the sidebar
2. Update profile information:
   - Name
   - Email
   - Contact details
3. Change password:
   - Enter current password
   - Set new password (min. 6 characters)

#### Application Preferences
- Customize dashboard view
- Set notification preferences
- Configure email notification settings
- Manage display preferences
