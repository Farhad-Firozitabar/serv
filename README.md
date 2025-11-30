# سرو (Sarv)

سرو یک سامانه مدرن و تحت‌وب برای مدیریت کافه است که با Next.js 14، TypeScript، Prisma و PostgreSQL ساخته شده. سرو از دو پلن اشتراکی (پایه و حرفه‌ای) پشتیبانی می‌کند و یک ناحیه مدیریت مرکزی برای کنترل کاربران و سطوح دسترسی دارد.

## Features

### Subscription Tiers

#### Basic Plan
- Sales management and invoice generation
- Simple inventory (stock in/out)
- Basic reports (daily/weekly/monthly sales)
- One connected receipt printer (browser print)

#### Professional Plan
- All Basic features
- Advanced inventory (low-stock alerts, expiration, reorder level)
- Full accounting (ledger, profit/loss, expenses)
- Customer loyalty (points, discounts)
- Analytical charts and dashboards
- Automatic daily backup
- Server-side printing via IPP
- Email support

### User Roles

#### Admin
- View all users
- Assign or change user plan (Basic or Professional)
- Deactivate users
- Manage system-wide settings

#### کاربر سرو
- Access dashboard according to plan
- Register printers
- Record sales and manage inventory
- View reports

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Auth**: JWT with Next.js cookies
- **PDF Generation**: pdf-lib
- **Printing**: IPP protocol (Professional) or browser print (Basic)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- PostgreSQL database
- Environment variables configured

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd serv
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sarv"
JWT_SECRET="your-secret-key-here"
IPP_ENDPOINT="http://localhost:3001" # Optional, for Professional plan IPP printing
```

4. Set up the database:
```bash
# Push Prisma schema to database
pnpm db:push

# Seed the database with initial data
pnpm db:seed
```

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin Credentials

After seeding, you can log in with:
- **Email**: `admin@sarv.app`
- **Password**: `admin123`

## Project Structure

```
sarv/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/          # Main dashboard pages
│   │   ├── sales/          # Sales management
│   │   ├── inventory/      # Inventory management
│   │   ├── accounting/     # Accounting (Professional+)
│   │   ├── customers/       # Customer management
│   │   ├── reports/         # Reports and analytics
│   │   ├── printers/       # Printer management
│   │   ├── settings/       # User settings
│   │   └── admin/          # Admin dashboard
│   └── api/                # API routes
│       ├── auth/           # Authentication endpoints
│       ├── sales/          # Sales endpoints
│       ├── inventory/      # Inventory endpoints
│       ├── printers/       # Printer endpoints
│       ├── reports/        # Report endpoints
│       ├── subscription/   # Subscription endpoints
│       └── admin/          # Admin endpoints
├── components/             # React components
│   ├── ui/                # UI components
│   ├── forms/             # Form components
│   ├── charts/            # Chart components
│   └── printers/          # Printer components
├── lib/                   # Utility libraries
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # Authentication helpers
│   ├── pdf.ts             # PDF generation
│   ├── printer.ts         # Printer integration
│   └── subscription.ts    # Subscription helpers
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed script
└── public/                # Static assets
    └── invoices/          # Generated invoices
```

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Sales
- `POST /api/sales/create` - Create a new sale
- `GET /api/sales/get?id={saleId}` - Get sale details
- `GET /api/sales/invoice?id={saleId}` - Generate invoice PDF

### Inventory
- `GET /api/inventory/list` - List all products
- `POST /api/inventory/create` - Create a new product
- `PUT /api/inventory/update` - Update a product
- `DELETE /api/inventory/delete?id={productId}` - Delete a product
- `POST /api/inventory/adjust` - Adjust inventory quantity

### Printers
- `GET /api/printers/list` - List user's printers
- `POST /api/printers/register` - Register a new printer
- `POST /api/printers/job` - Send print job (Professional only)
- `GET /api/printers/status` - Get print job status

### Reports
- `GET /api/reports/summary` - Get sales summary
- `GET /api/reports/analytics` - Get detailed analytics (Professional only)

### Subscription
- `POST /api/subscription/check` - Check subscription access
- `POST /api/subscription/upgrade` - Request plan upgrade

### Admin
- `GET /api/admin/users/list` - List all users (Admin only)
- `POST /api/admin/users/update-plan` - Update user plan (Admin only)

## Database Models

- **User**: User accounts with roles and subscription tiers
- **Product**: Inventory products
- **Sale**: Sales transactions
- **SaleItem**: Items in a sale
- **InventoryLog**: Inventory change history
- **Customer**: Customer records with loyalty points
- **Printer**: Registered printers
- **PrintJob**: Print job history

## Development

### Database Migrations

```bash
# Create a new migration
pnpm db:migrate

# Push schema changes without migration
pnpm db:push
```

### Seeding

```bash
pnpm db:seed
```

### Building for Production

```bash
pnpm build
pnpm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `IPP_ENDPOINT` | IPP printing service endpoint | No (Professional feature) |

## License

This project is private and proprietary.

## Support

For issues and questions, please contact the development team.
