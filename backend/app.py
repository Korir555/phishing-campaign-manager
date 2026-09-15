from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from models import db, Campaign, Email, Detection, DetectionMetrics
from detector import get_detector
import uuid
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///phishing_campaign.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False

# Initialize database
db.init_app(app)

with app.app_context():
    db.create_all()


# ============ CAMPAIGN ENDPOINTS ============

@app.route('/api/campaign/create', methods=['POST'])
def create_campaign():
    """Create a new phishing campaign"""
    try:
        data = request.get_json()
        
        campaign = Campaign(
            name=data.get('name'),
            description=data.get('description'),
            subject_line=data.get('subject_line'),
            email_body=data.get('email_body'),
            payload_url=data.get('payload_url'),
            status='draft'
        )
        
        db.session.add(campaign)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'campaign_id': campaign.id,
            'message': 'Campaign created successfully'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/campaign/<campaign_id>', methods=['GET'])
def get_campaign(campaign_id):
    """Get campaign details"""
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'success': False, 'error': 'Campaign not found'}), 404
    
    return jsonify({
        'success': True,
        'campaign': campaign.to_dict()
    }), 200


@app.route('/api/campaign/<campaign_id>/send', methods=['POST'])
def send_campaign(campaign_id):
    """Send campaign emails (simulated or real)"""
    try:
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'success': False, 'error': 'Campaign not found'}), 404
        
        data = request.get_json()
        target_emails = data.get('target_emails', [])
        
        # Create email records
        for recipient_email in target_emails:
            email = Email(
                campaign_id=campaign_id,
                recipient_email=recipient_email,
                status='sent'
            )
            db.session.add(email)
        
        campaign.target_count = len(target_emails)
        campaign.sent_at = datetime.utcnow()
        campaign.status = 'sent'
        
        db.session.commit()
        
        # Analyze each email with detector
        detector = get_detector()
        for email in campaign.emails:
            email_data = {
                'sender': 'attacker@malicious.com',
                'subject': campaign.subject_line,
                'body': campaign.email_body,
                'html_content': campaign.email_body
            }
            
            result = detector.detect(email_data)
            
            detection = Detection(
                campaign_id=campaign_id,
                email_id=email.id,
                is_phishing=result['is_phishing'],
                confidence_score=result['confidence_score'],
                risk_level=result['risk_level'],
                sender_reputation_score=result['feature_scores'].get('sender_domain_age_ratio'),
                url_pattern_score=result['feature_scores'].get('url_shortener'),
                keyword_urgency_score=result['feature_scores'].get('suspicious_keywords'),
                html_similarity_score=result['feature_scores'].get('html_form_present'),
                reasons=result['reasons']
            )
            db.session.add(detection)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Campaign sent to {len(target_emails)} recipients',
            'emails_sent': len(target_emails)
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/campaign/<campaign_id>/metrics', methods=['GET'])
def get_campaign_metrics(campaign_id):
    """Get campaign metrics"""
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'success': False, 'error': 'Campaign not found'}), 404
    
    metrics = campaign.get_metrics()
    
    return jsonify({
        'success': True,
        'metrics': metrics
    }), 200


@app.route('/api/campaigns', methods=['GET'])
def list_campaigns():
    """List all campaigns"""
    campaigns = Campaign.query.all()
    
    return jsonify({
        'success': True,
        'campaigns': [c.to_dict() for c in campaigns],
        'total': len(campaigns)
    }), 200


# ============ DETECTION ENDPOINTS ============

@app.route('/api/detector/analyze', methods=['POST'])
def analyze_email():
    """Analyze single email with ML detector"""
    try:
        data = request.get_json()
        
        detector = get_detector()
        result = detector.detect(data)
        
        return jsonify({
            'success': True,
            'detection': result
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/campaign/<campaign_id>/detections', methods=['GET'])
def get_campaign_detections(campaign_id):
    """Get detection results for campaign"""
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'success': False, 'error': 'Campaign not found'}), 404
    
    detections = Detection.query.filter_by(campaign_id=campaign_id).all()
    
    # Calculate accuracy metrics
    total = len(detections)
    detected_phishing = sum(1 for d in detections if d.is_phishing)
    
    return jsonify({
        'success': True,
        'detections': [d.to_dict() for d in detections],
        'summary': {
            'total_emails': total,
            'detected_as_phishing': detected_phishing,
            'detection_rate': (detected_phishing / total * 100) if total > 0 else 0
        }
    }), 200


# ============ DASHBOARD ENDPOINTS ============

@app.route('/api/dashboard/overview', methods=['GET'])
def dashboard_overview():
    """Get overview for dashboard"""
    campaigns = Campaign.query.all()
    total_sent = sum(c.target_count for c in campaigns)
    
    # Campaign with highest success rate
    top_campaign = max(campaigns, key=lambda c: c.get_metrics()['success_rate'], default=None)
    
    return jsonify({
        'success': True,
        'overview': {
            'total_campaigns': len(campaigns),
            'total_emails_sent': total_sent,
            'active_campaigns': sum(1 for c in campaigns if c.status == 'sent'),
            'top_campaign': top_campaign.to_dict() if top_campaign else None
        }
    }), 200


@app.route('/api/events/timeline', methods=['GET'])
def events_timeline():
    """Get timeline of events (sent → clicked → detected)"""
    campaign_id = request.args.get('campaign_id')
    
    if not campaign_id:
        return jsonify({'success': False, 'error': 'campaign_id required'}), 400
    
    emails = Email.query.filter_by(campaign_id=campaign_id).all()
    detections = Detection.query.filter_by(campaign_id=campaign_id).all()
    
    events = []
    
    # Add email sent events
    for email in emails:
        events.append({
            'type': 'sent',
            'timestamp': email.sent_at.isoformat() if email.sent_at else None,
            'email': email.recipient_email,
            'description': f'Phishing email sent to {email.recipient_email}'
        })
        
        if email.clicked:
            events.append({
                'type': 'clicked',
                'timestamp': email.clicked_at.isoformat() if email.clicked_at else None,
                'email': email.recipient_email,
                'description': f'{email.recipient_email} clicked link'
            })
    
    # Add detection events
    for detection in detections:
        events.append({
            'type': 'detected',
            'timestamp': detection.analyzed_at.isoformat() if detection.analyzed_at else None,
            'email': detection.email.recipient_email,
            'description': f'Email flagged as phishing (confidence: {detection.confidence_score:.2%})',
            'confidence': detection.confidence_score
        })
    
    # Sort by timestamp
    events.sort(key=lambda e: e.get('timestamp') or '')
    
    return jsonify({
        'success': True,
        'events': events,
        'total': len(events)
    }), 200


# ============ HEALTH CHECK ============

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5014)
