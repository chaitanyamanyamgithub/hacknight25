"""
Database configuration and initialization for the Healthcare EHR Backend
"""

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# Initialize SQLAlchemy
db = SQLAlchemy()

class Notification(db.Model):
    """Notification model for user notifications"""
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # appointment, record, message, system
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# User Model
class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'  # Explicitly set table name
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'doctor' or 'patient'
    specialization = db.Column(db.String(100))  # for doctors
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    ethereum_address = db.Column(db.String(42), nullable=True)
    
    # Relationships
    appointments_as_doctor = db.relationship('Appointment', backref='doctor', foreign_keys='Appointment.doctor_id')
    appointments_as_patient = db.relationship('Appointment', backref='patient', foreign_keys='Appointment.patient_id')
    records_as_doctor = db.relationship('MedicalRecord', backref='doctor', foreign_keys='MedicalRecord.doctor_id')
    records_as_patient = db.relationship('MedicalRecord', backref='patient', foreign_keys='MedicalRecord.patient_id')
    notifications = db.relationship('Notification', backref='user', lazy=True)
    
    def __repr__(self):
        return f'<User {self.full_name} ({self.type})>'
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary for API responses"""
        return {
            'id': self.id,
            'email': self.email,
            'fullName': self.full_name,
            'type': self.type,
            'specialization': self.specialization,
            'phone': self.phone,
            'ethereum_address': self.ethereum_address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class Appointment(db.Model):
    """Appointment model"""
    __tablename__ = 'appointments'  # Explicitly set table name
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MedicalRecord(db.Model):
    """Medical Record model"""
    __tablename__ = 'medical_records'  # Explicitly set table name
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.DateTime, nullable=False)
    is_on_blockchain = db.Column(db.Boolean, default=False)
    blockchain_hash = db.Column(db.String(66))  # Ethereum transaction hash
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PatientProfile(db.Model):
    """Patient Profile model for additional patient information"""
    __tablename__ = 'patient_profiles'  # Explicitly set table name
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    blood_type = db.Column(db.String(5))
    allergies = db.Column(db.Text)
    medical_conditions = db.Column(db.Text)
    emergency_contact = db.Column(db.String(100))
    emergency_phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('patient_profile', uselist=False))

def init_db(app):
    """Initialize the database"""
    # Set up SQLAlchemy with app
    db.init_app(app)

    with app.app_context():
        try:
            # Create all tables if they don't exist
            print("Database initialized successfully")
            
            # For a clean state, drop all existing tables and recreate
            db.drop_all()
            db.create_all()
            
            # Create test data if in development
            if app.config.get('DEBUG', False):
                try:
                    create_test_data()
                except Exception as e:
                    print(f"Error creating test data: {str(e)}")
                    # Even if test data creation fails, we can continue
                    # This prevents the app from failing to start
                    
        except Exception as e:
            print(f"Error initializing database: {str(e)}")
            # Create tables without dropping existing ones as a fallback
            try:
                print("Attempting fallback database initialization...")
                db.create_all()
                print("Fallback database initialization successful")
            except Exception as inner_e:
                print(f"Critical database error: {str(inner_e)}")
                # Continue anyway to prevent app from crashing
                # but services requiring database will fail

def create_test_data():
    """Create test data for development"""
    try:
        # Create test doctors
        doctors = [
            {
                'email': 'doctor1@example.com',
                'full_name': 'Dr. John Smith',
                'type': 'doctor',
                'specialization': 'Cardiology',
                'phone': '1234567890',
                'password': 'Doctor@123'
            },
            {
                'email': 'doctor2@example.com',
                'full_name': 'Dr. Sarah Wilson',
                'type': 'doctor',
                'specialization': 'Neurology',
                'phone': '2345678901',
                'password': 'Doctor@456'
            }
        ]
        
        # Create test patients
        patients = [
            {
                'email': 'patient1@example.com',
                'full_name': 'Jane Doe',
                'type': 'patient',
                'phone': '3456789012',
                'password': 'Patient@123'
            },
            {
                'email': 'patient2@example.com',
                'full_name': 'John Brown',
                'type': 'patient',
                'phone': '4567890123',
                'password': 'Patient@456'
            }
        ]
        
        # Add doctors to database
        created_doctors = []
        for doctor_data in doctors:
            doctor = User(
                email=doctor_data['email'],
                full_name=doctor_data['full_name'],
                type=doctor_data['type'],
                specialization=doctor_data['specialization'],
                phone=doctor_data['phone']
            )
            doctor.set_password(doctor_data['password'])
            db.session.add(doctor)
            created_doctors.append((doctor, doctor_data))
        
        # Add patients to database
        created_patients = []
        for patient_data in patients:
            patient = User(
                email=patient_data['email'],
                full_name=patient_data['full_name'],
                type=patient_data['type'],
                phone=patient_data['phone']
            )
            patient.set_password(patient_data['password'])
            db.session.add(patient)
            created_patients.append((patient, patient_data))
        
        # Commit users to get their IDs
        db.session.commit()
        
        # Now add notifications with valid user IDs
        for doctor, doctor_data in created_doctors:
            notification = Notification(
                user_id=doctor.id,
                title='Welcome Doctor',
                message=f'Welcome to Arogya Mithra EHR System, Dr. {doctor_data["full_name"].split()[-1]}',
                type='system',
                is_read=False
            )
            db.session.add(notification)
        
        for patient, patient_data in created_patients:
            notification = Notification(
                user_id=patient.id,
                title='Welcome Patient',
                message=f'Welcome to Arogya Mithra EHR System, {patient_data["full_name"]}',
                type='system',
                is_read=False
            )
            db.session.add(notification)
        
        # Commit notifications
        db.session.commit()
        
        print("Test data created successfully")
        print("\nTest Accounts:")
        print("\nDoctors:")
        for doc in doctors:
            print(f"Email: {doc['email']}")
            print(f"Password: {doc['password']}\n")
        print("\nPatients:")
        for pat in patients:
            print(f"Email: {pat['email']}")
            print(f"Password: {pat['password']}\n")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating test data: {str(e)}")
        raise 