"""
Notification model for the Healthcare EHR Backend
"""

from datetime import datetime
from models.db import db

class Notification(db.Model):
    """Notification model for user notifications"""
    
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # appointment, record, message, system
    is_read = db.Column(db.Boolean, default=False)
    reference_id = db.Column(db.Integer, nullable=True)  # ID of the related entity (appointment, record, etc.)
    reference_type = db.Column(db.String(50), nullable=True)  # Type of the related entity
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Notification {self.id} - {self.title} - {self.is_read}>'
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        db.session.commit()
    
    def to_dict(self):
        """Convert notification to dictionary for API responses"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'reference_id': self.reference_id,
            'reference_type': self.reference_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def create_notification(cls, user_id, title, message, type, reference_id=None, reference_type=None):
        """
        Create a new notification
        
        Args:
            user_id (int): The user ID
            title (str): The notification title
            message (str): The notification message
            type (str): The notification type
            reference_id (int, optional): The ID of the related entity
            reference_type (str, optional): The type of the related entity
            
        Returns:
            Notification: The created notification
        """
        notification = cls(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            reference_id=reference_id,
            reference_type=reference_type
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return notification
    
    @classmethod
    def get_unread_notifications(cls, user_id, limit=10):
        """
        Get unread notifications for a user
        
        Args:
            user_id (int): The user ID
            limit (int): The maximum number of notifications to return
            
        Returns:
            list: List of Notification objects
        """
        return (cls.query
               .filter(cls.user_id == user_id)
               .filter(cls.is_read == False)
               .order_by(cls.created_at.desc())
               .limit(limit)
               .all()) 