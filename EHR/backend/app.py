"""
Simple demonstration version of the Healthcare EHR Backend API
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from datetime import timedelta, datetime
import re
from models.db import init_db, User, db
from config.settings import load_config

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return False, "Password must contain at least one special character"
    return True, ""

# Create the Flask app
app = Flask(__name__)

# Load configuration
config = load_config()
app.config.from_object(config)

# Setup JWT
app.config['JWT_SECRET_KEY'] = config.JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# Initialize database
init_db(app)

# Enable CORS with proper configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

@app.errorhandler(400)
def bad_request(error):
    """Handle 400 Bad Request errors"""
    return jsonify({"error": str(error.description)}), 400

@app.errorhandler(401)
def unauthorized(error):
    """Handle 401 Unauthorized errors"""
    return jsonify({"error": "Unauthorized access"}), 401

@app.errorhandler(403)
def forbidden(error):
    """Handle 403 Forbidden errors"""
    return jsonify({"error": "Forbidden"}), 403

@app.errorhandler(404)
def not_found(error):
    """Handle 404 Not Found errors"""
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_server_error(error):
    """Handle 500 Internal Server Error"""
    return jsonify({"error": "Internal server error"}), 500

# Home route
@app.route('/')
def index():
    """API home route"""
    return jsonify({
        "message": "Healthcare EHR API",
        "status": "Running",
        "version": "1.0.0-demo"
    })

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        app.logger.info(f"Registration request received: {data}")

        if not data:
            app.logger.error("No data provided in registration request")
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        required_fields = ['email', 'password', 'confirmPassword', 'fullName', 'type', 'phone']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            app.logger.error(f"Missing required fields: {missing_fields}")
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Validate email format
        if not validate_email(data['email']):
            app.logger.error(f"Invalid email format: {data['email']}")
            return jsonify({"error": "Invalid email format"}), 400

        # Validate password
        if not data.get('password'):
            app.logger.error("Password is missing")
            return jsonify({"error": "Password is required"}), 400

        # Validate password strength
        is_valid, password_error = validate_password(data['password'])
        if not is_valid:
            app.logger.error(f"Invalid password: {password_error}")
            return jsonify({"error": password_error}), 400

        # Check if passwords match
        if data.get('password') != data.get('confirmPassword'):
            app.logger.error("Passwords do not match")
            return jsonify({"error": "Passwords do not match"}), 400

        # Validate user type
        if data['type'] not in ['doctor', 'patient']:
            app.logger.error(f"Invalid user type: {data['type']}")
            return jsonify({"error": "Invalid user type"}), 400

        # Validate phone number format
        phone = data.get('phone', '').strip()
        if not phone or not phone.replace('+', '').isdigit() or len(phone.replace('+', '')) < 10:
            app.logger.error(f"Invalid phone number format: {phone}")
            return jsonify({"error": "Invalid phone number format"}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            app.logger.error(f"Email already registered: {data['email']}")
            return jsonify({"error": "Email already registered"}), 400
        
        # Create new user with proper field mapping
        user = User(
            email=data['email'],
            full_name=data['fullName'],
            type=data['type'],
            specialization=data.get('specialization'),
            phone=phone
        )
        user.set_password(data['password'])
        
        # Save to database
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        app.logger.info(f"User registered successfully: {user.email}")
        return jsonify({
            "message": "User registered successfully",
            "token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "type": user.type,
                "fullName": user.full_name,
                "specialization": user.specialization,
                "phone": user.phone
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Registration error: {str(e)}")
        return jsonify({"error": "Failed to register user. Please try again."}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        app.logger.info(f"Login request received: {data}")

        if not data:
            app.logger.error("No data provided in login request")
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        if 'email' not in data or 'password' not in data:
            app.logger.error("Missing required fields in login request")
            return jsonify({"error": "Email and password are required"}), 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        app.logger.info(f"User found: {user is not None}")
        
        if not user:
            app.logger.error(f"User not found for email: {data['email']}")
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Check if user is active
        if not user.is_active:
            app.logger.error(f"Inactive user attempted login: {user.email}")
            return jsonify({"error": "Account is inactive. Please contact support."}), 401
        
        # Check if password is correct
        is_valid = user.check_password(data['password'])
        app.logger.info(f"Password valid: {is_valid}")
        
        if is_valid:
            # Update last login
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            # Create access token
            access_token = create_access_token(identity=user.id)
            
            app.logger.info(f"User logged in successfully: {user.email}")
            return jsonify({
                "message": "Login successful",
                "token": access_token,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "type": user.type,
                    "fullName": user.full_name,
                    "specialization": user.specialization,
                    "phone": user.phone
                }
            }), 200
        else:
            app.logger.error(f"Invalid password for user: {user.email}")
            return jsonify({"error": "Invalid email or password"}), 401

    except Exception as e:
        app.logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Failed to login. Please try again."}), 400

@app.route('/api/auth/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify JWT token and return user info"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "type": user.type,
                "fullName": user.full_name,
                "specialization": user.specialization
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Protected routes
@app.route('/api/patients', methods=['GET'])
@jwt_required()
def get_patients():
    """Get patients endpoint"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.type != 'doctor':
            return jsonify({"error": "Unauthorized access"}), 403
            
        # TODO: Implement actual patient fetching
        return jsonify({
            "success": True,
            "patients": [
                {
                    "id": 1,
                    "name": "Jane Doe",
                    "age": 42,
                    "blood_type": "A+",
                    "user": {
                        "id": 2,
                        "email": "patient1@example.com"
                    }
                }
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    """Get appointments endpoint"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # TODO: Implement actual appointment fetching based on user type
        return jsonify({
            "success": True,
            "appointments": [
                {
                    "id": 1,
                    "patient_id": 1,
                    "doctor_id": 1,
                    "title": "Regular Checkup",
                    "date": "2023-04-10T10:00:00",
                    "status": "scheduled",
                    "patient": {
                        "id": 1,
                        "name": "Jane Doe"
                    },
                    "doctor": {
                        "id": 1,
                        "name": "Dr. John Smith"
                    }
                }
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/records', methods=['GET'])
@jwt_required()
def get_records():
    """Get medical records endpoint"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # TODO: Implement actual record fetching based on user type
        return jsonify({
            "success": True,
            "records": [
                {
                    "id": 1,
                    "patient_id": 1,
                    "doctor_id": 1,
                    "title": "Annual Checkup",
                    "type": "Examination",
                    "description": "Regular annual physical examination",
                    "date": "2023-03-15T09:30:00",
                    "is_on_blockchain": True
                }
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Get specific patient (mock)
@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Mock specific patient endpoint"""
    return jsonify({
        "success": True,
        "patient": {
            "id": patient_id,
            "name": "Jane Doe",
            "age": 42,
            "blood_type": "A+",
            "allergies": "Penicillin",
            "user": {
                "id": 2,
                "email": "patient1@example.com"
            }
        }
    })

# Get medical records (mock)
@app.route('/api/records', methods=['GET'])
def get_records_mock():
    """Mock records endpoint"""
    return jsonify({
        "success": True,
        "records": [
            {
                "id": 1,
                "patient_id": 1,
                "doctor_id": 1,
                "title": "Annual Checkup",
                "type": "Examination",
                "description": "Regular annual physical examination",
                "date": "2023-03-15T09:30:00",
                "is_on_blockchain": True
            },
            {
                "id": 2,
                "patient_id": 1,
                "doctor_id": 1,
                "title": "Blood Test Results",
                "type": "Lab Results",
                "description": "Complete blood count and metabolic panel",
                "date": "2023-03-20T14:15:00",
                "is_on_blockchain": False
            }
        ]
    })

# Get specific record (mock)
@app.route('/api/records/<int:record_id>', methods=['GET'])
def get_record(record_id):
    """Mock specific record endpoint"""
    return jsonify({
        "success": True,
        "record": {
            "id": record_id,
            "patient_id": 1,
            "doctor_id": 1,
            "title": "Annual Checkup",
            "type": "Examination",
            "description": "Regular annual physical examination",
            "date": "2023-03-15T09:30:00",
            "is_on_blockchain": True
        }
    })

# Create record (mock)
@app.route('/api/records', methods=['POST'])
def create_record():
    """Mock create record endpoint"""
    print("Create record request received:", request.json)
    return jsonify({
        "success": True,
        "message": "Record created successfully",
        "record": {
            "id": 3,
            "patient_id": request.json.get('patient_id', 1),
            "doctor_id": 1,
            "title": request.json.get('title', 'New Record'),
            "type": request.json.get('type', 'Examination'),
            "description": request.json.get('description', 'Description'),
            "date": "2023-03-22T10:00:00",
            "is_on_blockchain": False
        }
    })

# Get blockchain status (mock)
@app.route('/api/blockchain/status', methods=['GET'])
def get_blockchain_status():
    """Mock blockchain status endpoint"""
    return jsonify({
        "success": True,
        "ethereum": {
            "connected": True,
            "network": "Local Development Chain",
            "block_number": 12345
        },
        "hyperledger": {
            "connected": True,
            "channel": "healthchannel",
            "chaincode": "medicalrecords"
        }
    })

# Store record on blockchain (mock)
@app.route('/api/records/<int:record_id>/blockchain', methods=['POST'])
def store_on_blockchain(record_id):
    """Mock store on blockchain endpoint"""
    print(f"Storing record {record_id} on blockchain")
    return jsonify({
        "success": True,
        "message": "Record stored on blockchain successfully",
        "blockchain_record": {
            "transaction_hash": f"0x{'0'*64}",
            "block_number": 12345,
            "timestamp": "2023-03-22T10:05:00"
        }
    })

# AI anomaly detection (mock)
@app.route('/api/ai/anomaly-detection', methods=['POST'])
def anomaly_detection():
    """Mock AI anomaly detection endpoint"""
    return jsonify({
        "success": True,
        "anomalies": [
            {
                "type": "blood_pressure_change",
                "severity": "medium",
                "description": "Significant change in blood pressure between records"
            }
        ]
    })

# AI health prediction (mock)
@app.route('/api/ai/health-prediction', methods=['POST'])
def health_prediction():
    """Mock AI health prediction endpoint"""
    return jsonify({
        "success": True,
        "predictions": {
            "risk_levels": {
                "cardiovascular": "moderate",
                "diabetes": "low",
                "respiratory": "low"
            },
            "recommendations": [
                {
                    "type": "cardiovascular",
                    "description": "Regular cardiovascular check-ups recommended",
                    "frequency": "Yearly"
                }
            ]
        }
    })

# Get doctors (mock)
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    """Mock doctors endpoint"""
    return jsonify({
        "success": True,
        "doctors": [
            {
                "id": 1,
                "name": "Dr. John Smith",
                "specialization": "Cardiology",
                "hospital": "General Hospital",
                "user": {
                    "id": 1,
                    "email": "doctor@example.com"
                }
            }
        ]
    })

# Add more API endpoints as needed for your frontend

if __name__ == '__main__':
    # Run the app
    app.run(debug=True, host='127.0.0.1', port=5000) 