"""
Patient model for the Healthcare EHR Backend
"""

from datetime import datetime
from models.db import db

class Patient(db.Model):
    """Patient model representing patient-specific information"""
    
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date_of_birth = db.Column(db.DateTime, nullable=True)
    blood_type = db.Column(db.String(5), nullable=True)
    allergies = db.Column(db.Text, nullable=True)
    emergency_contact = db.Column(db.String(255), nullable=True)
    medical_history = db.Column(db.Text, nullable=True)
    insurance_provider = db.Column(db.String(100), nullable=True)
    insurance_id = db.Column(db.String(50), nullable=True)
    
    # Relationships
    user = db.relationship('User', back_populates='patient')
    medical_records = db.relationship('MedicalRecord', backref='patient', lazy=True, cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='patient', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Patient {self.user.name} ({self.id})>'
    
    def get_age(self):
        """Calculate patient age based on date of birth"""
        if not self.date_of_birth:
            return None
        
        today = datetime.utcnow()
        age = today.year - self.date_of_birth.year
        
        # Adjust age if birthday hasn't occurred yet this year
        if (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day):
            age -= 1
            
        return age
    
    def to_dict(self, include_user=True):
        """Convert patient to dictionary for API responses"""
        data = {
            'id': self.id,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'age': self.get_age(),
            'blood_type': self.blood_type,
            'allergies': self.allergies,
            'emergency_contact': self.emergency_contact,
            'medical_history': self.medical_history,
            'insurance_provider': self.insurance_provider,
            'insurance_id': self.insurance_id
        }
        
        if include_user and self.user:
            data['user'] = self.user.to_dict()
            
        return data 