# Healthcare EHR System with Blockchain Integration

A comprehensive Electronic Health Record (EHR) system with blockchain integration for secure and immutable medical records.

## Features

- **User Authentication**: Secure login and registration for doctors and patients
- **Medical Records Management**: Create, view, and manage medical records
- **Appointment Scheduling**: Schedule and manage appointments between doctors and patients
- **Blockchain Integration**: Store medical records on Ethereum and Hyperledger Fabric blockchains
- **AI-Powered Analytics**: Anomaly detection and health risk predictions
- **Data Visualization**: Interactive charts and statistics for healthcare data
- **MetaMask Integration**: Connect with Ethereum wallets for blockchain transactions
- **Responsive UI**: Modern and user-friendly interface for all devices

## Technology Stack

### Frontend
- React.js with Hooks
- React Router for navigation
- Tailwind CSS for styling
- Chart.js for data visualization
- Web3.js for Ethereum integration

### Backend
- Flask RESTful API
- SQLAlchemy ORM
- JWT Authentication
- Web3.py for Ethereum integration
- Hyperledger Fabric SDK for blockchain integration
- Scikit-learn for AI models

### Blockchain
- Ethereum (MetaMask)
- Hyperledger Fabric

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- MetaMask browser extension
- Hyperledger Fabric network (optional)
- Ganache for local Ethereum development (optional)

## Installation

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/healthcare-ehr.git
   cd healthcare-ehr
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Set up environment variables (create a `.env` file in the backend directory):
   ```
   FLASK_APP=app.py
   FLASK_ENV=development
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret-key
   DATABASE_URI=sqlite:///ehr.db
   ETHEREUM_RPC=http://localhost:8545
   ETHEREUM_CHAIN_ID=1337
   SMART_CONTRACT_ADDRESS=0x...
   ```

5. Initialize the database:
   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```

### Frontend Setup

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env` file in the frontend directory:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## Running the Application

### Start the Backend

```bash
cd backend
flask run
```

The backend API will be available at http://localhost:5000.

### Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend application will be available at http://localhost:5173.

## Blockchain Setup

### Ethereum (MetaMask)

1. Install the MetaMask browser extension
2. Create or import a wallet
3. Connect to the appropriate network:
   - For development: Localhost 8545 (Ganache)
   - For testing: Goerli or Sepolia Testnet
   - For production: Ethereum Mainnet

### Hyperledger Fabric

For Hyperledger Fabric setup, follow the official documentation:
[Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)

## API Documentation

The API documentation is available at http://localhost:5000/api/docs when the backend is running.

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment

1. Set up a production server (e.g., AWS, DigitalOcean)
2. Install dependencies
3. Configure environment variables for production
4. Use Gunicorn as the WSGI server:
   ```bash
   gunicorn -w 4 app:app
   ```

### Frontend Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the contents of the `dist` directory to a static hosting service (e.g., Netlify, Vercel, AWS S3)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Flask](https://flask.palletsprojects.com/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Web3.js](https://web3js.readthedocs.io/)
- [Hyperledger Fabric](https://www.hyperledger.org/use/fabric)
- [MetaMask](https://metamask.io/) 