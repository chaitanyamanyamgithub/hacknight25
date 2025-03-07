"""
Appointment model for the Healthcare EHR Backend
"""

from datetime import datetime
from models.db import db

class Appointment(db.Model):
    """Appointment model for scheduling doctor-patient meetings"""
    
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, default=30)  # Duration in minutes
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, cancelled
    location = db.Column(db.String(100), nullable=True)
    is_virtual = db.Column(db.Boolean, default=False)
    meeting_link = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Appointment {self.title} - {self.date.strftime("%Y-%m-%d %H:%M")} - {self.status}>'
    
    def to_dict(self, include_doctor=False, include_patient=False):
        """Convert appointment to dictionary for API responses"""
        data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'title': self.title,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'duration': self.duration,
            'status': self.status,
            'location': self.location,
            'is_virtual': self.is_virtual,
            'meeting_link': self.meeting_link,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_doctor and hasattr(self, 'doctor'):
            data['doctor'] = self.doctor.to_dict(include_user=True)
            
        if include_patient and hasattr(self, 'patient'):
            data['patient'] = self.patient.to_dict(include_user=True)
            
        return data
    
    @staticmethod
    def get_upcoming_appointments(user_id, user_type, limit=10):
        """
        Get upcoming appointments for a doctor or patient
        
        Args:
            user_id (int): The doctor or patient ID
            user_type (str): The user type ('doctor' or 'patient')
            limit (int): The maximum number of appointments to return
            
        Returns:
            list: List of Appointment objects
        """
        now = datetime.utcnow()
        
        if user_type == 'doctor':
            return (Appointment.query
                   .filter(Appointment.doctor_id == user_id)
                   .filter(Appointment.date >= now)
                   .filter(Appointment.status == 'scheduled')
                   .order_by(Appointment.date)
                   .limit(limit)
                   .all())
        elif user_type == 'patient':
            return (Appointment.query
                   .filter(Appointment.patient_id == user_id)
                   .filter(Appointment.date >= now)
                   .filter(Appointment.status == 'scheduled')
                   .order_by(Appointment.date)
                   .limit(limit)
                   .all())
        else:
            raise ValueError(f"Invalid user type: {user_type}")
            
    def cancel(self):
        """Cancel this appointment"""
        self.status = 'cancelled'
        self.updated_at = datetime.utcnow()
        db.session.commit()
        
    def complete(self):
        """Mark this appointment as completed"""
        self.status = 'completed'
        self.updated_at = datetime.utcnow()
        db.session.commit()