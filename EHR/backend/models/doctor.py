"""
Doctor model for the Healthcare EHR Backend
"""

from models.db import db

class Doctor(db.Model):
    """Doctor model representing doctor-specific information"""
    
    __tablename__ = 'doctors'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    specialization = db.Column(db.String(100), nullable=True)
    license_number = db.Column(db.String(50), nullable=True)
    hospital = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    education = db.Column(db.Text, nullable=True)
    years_of_experience = db.Column(db.Integer, nullable=True)
    
    # Relationships
    user = db.relationship('User', back_populates='doctor')
    medical_records = db.relationship('MedicalRecord', backref='doctor', lazy=True)
    appointments = db.relationship('Appointment', backref='doctor', lazy=True)
    
    def __repr__(self):
        return f'<Doctor {self.user.name} ({self.specialization})>'
    
    def to_dict(self, include_user=True):
        """Convert doctor to dictionary for API responses"""
        data = {
            'id': self.id,
            'specialization': self.specialization,
            'license_number': self.license_number,
            'hospital': self.hospital,
            'bio': self.bio,
            'education': self.education,
            'years_of_experience': self.years_of_experience
        }
        
        if include_user and self.user:
            data['user'] = self.user.to_dict()
            
        return data 