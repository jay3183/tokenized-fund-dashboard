# Tokenized Fund Dashboard

A modern web application for managing tokenized investment funds. This dashboard provides interfaces for investors, fund managers, and administrators to interact with tokenized funds on the blockchain.


## 🎮 Demo

Check out the video walkthrough: [Watch on YouTube](https://youtu.be/demo)

## 🚀 Features

- **Investor Features**
  - Portfolio overview with current fund performance
  - Transaction history with filtering options
  - Yield tracking and management
  - Fund subscription and redemption

- **Manager Features**
  - Fund performance tracking
  - Investor management
  - Yield distribution control
  - Custom reporting

- **Admin Features**
  - User management
  - NAV controls
  - Audit logs
  - System configuration

## 🛠️ Technology Stack

- **Frontend**: React, Tailwind CSS, Vite
- **State Management**: React Context API
- **Data Fetching**: Apollo Client (GraphQL)
- **Authentication**: JWT
- **Visualization**: Chart.js/Recharts
- **Testing**: Vitest, React Testing Library

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tokenized-fund-dashboard.git

# Navigate to the project directory
cd tokenized-fund-dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔧 What You'll Need

- Node.js (v16+)
- npm or yarn
- SQLite or PostgreSQL

## 🧪 Testing

The project uses Vitest and React Testing Library for testing. We have comprehensive test coverage for utility functions and key components.

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

Our test suite includes:

- **Utility Tests**: Tests for formatter functions that handle currency, dates, and percentages
- **Component Tests**: Tests for UI components like DeltaBadge, FundCard, and TransactionHistory
- **Context Tests**: Tests for authentication and role-based access control

Tests are located in `__tests__` directories adjacent to the files they test.

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
