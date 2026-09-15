from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class Campaign(db.Model):
    """Phishing campaign model"""
    __tablename__ = 'campaigns'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    subject_line = db.Column(db.String(255), nullable=False)
    email_body = db.Column(db.Text, nullable=False)
    payload_url = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    sent_at = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='draft')  # draft, sent, completed
    target_count = db.Column(db.Integer, default=0)
    
    # Relationships
    emails = db.relationship('Email', backref='campaign', lazy=True, cascade='all, delete-orphan')
    detections = db.relationship('Detection', backref='campaign', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'subject_line': self.subject_line,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'target_count': self.target_count,
            'metrics': self.get_metrics()
        }
    
    def get_metrics(self):
        """Calculate campaign metrics"""
        total_sent = len(self.emails)
        opened = sum(1 for e in self.emails if e.opened)
        clicked = sum(1 for e in self.emails if e.clicked)
        credentials_entered = sum(1 for e in self.emails if e.credentials_captured)
        
        return {
            'sent': total_sent,
            'opened': opened,
            'opened_rate': (opened / total_sent * 100) if total_sent > 0 else 0,
            'clicked': clicked,
            'click_rate': (clicked / total_sent * 100) if total_sent > 0 else 0,
            'credentials_captured': credentials_entered,
            'success_rate': (credentials_entered / total_sent * 100) if total_sent > 0 else 0
        }


class Email(db.Model):
    """Individual email in campaign"""
    __tablename__ = 'emails'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = db.Column(db.String(36), db.ForeignKey('campaigns.id'), nullable=False)
    recipient_email = db.Column(db.String(255), nullable=False)
    recipient_name = db.Column(db.String(255))
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    opened = db.Column(db.Boolean, default=False)
    opened_at = db.Column(db.DateTime)
    clicked = db.Column(db.Boolean, default=False)
    clicked_at = db.Column(db.DateTime)
    credentials_captured = db.Column(db.Boolean, default=False)
    captured_username = db.Column(db.String(255))
    captured_password = db.Column(db.String(255))
    ip_address = db.Column(db.String(15))
    user_agent = db.Column(db.Text)
    status = db.Column(db.String(50), default='sent')  # sent, opened, clicked, captured
    
    # Relationship to detections
    detections = db.relationship('Detection', backref='email', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'campaign_id': self.campaign_id,
            'recipient_email': self.recipient_email,
            'recipient_name': self.recipient_name,
            'sent_at': self.sent_at.isoformat(),
            'opened': self.opened,
            'clicked': self.clicked,
            'credentials_captured': self.credentials_captured,
            'status': self.status
        }


class Detection(db.Model):
    """ML detector results for each email"""
    __tablename__ = 'detections'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = db.Column(db.String(36), db.ForeignKey('campaigns.id'), nullable=False)
    email_id = db.Column(db.String(36), db.ForeignKey('emails.id'), nullable=False)
    analyzed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Detection results
    is_phishing = db.Column(db.Boolean, nullable=False)
    confidence_score = db.Column(db.Float)  # 0.0 to 1.0
    risk_level = db.Column(db.String(50))  # low, medium, high, critical
    
    # Feature scores
    sender_reputation_score = db.Column(db.Float)
    url_pattern_score = db.Column(db.Float)
    keyword_urgency_score = db.Column(db.Float)
    html_similarity_score = db.Column(db.Float)
    
    # Detection explanation
    reasons = db.Column(db.JSON)  # List of reasons why flagged as phishing
    
    def to_dict(self):
        return {
            'id': self.id,
            'campaign_id': self.campaign_id,
            'email_id': self.email_id,
            'is_phishing': self.is_phishing,
            'confidence_score': self.confidence_score,
            'risk_level': self.risk_level,
            'reasons': self.reasons,
            'analyzed_at': self.analyzed_at.isoformat()
        }


class DetectionMetrics(db.Model):
    """Aggregate detection metrics per campaign"""
    __tablename__ = 'detection_metrics'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = db.Column(db.String(36), db.ForeignKey('campaigns.id'), unique=True)
    
    # Confusion matrix
    true_positives = db.Column(db.Integer, default=0)    # Phishing detected as phishing
    false_positives = db.Column(db.Integer, default=0)   # Legitimate detected as phishing
    true_negatives = db.Column(db.Integer, default=0)    # Legitimate detected as legitimate
    false_negatives = db.Column(db.Integer, default=0)   # Phishing detected as legitimate
    
    # Metrics
    accuracy = db.Column(db.Float)
    precision = db.Column(db.Float)
    recall = db.Column(db.Float)
    f1_score = db.Column(db.Float)
    
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'campaign_id': self.campaign_id,
            'confusion_matrix': {
                'tp': self.true_positives,
                'fp': self.false_positives,
                'tn': self.true_negatives,
                'fn': self.false_negatives
            },
            'metrics': {
                'accuracy': self.accuracy,
                'precision': self.precision,
                'recall': self.recall,
                'f1_score': self.f1_score
            }
        }
