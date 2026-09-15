import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pickle
import os
from datetime import datetime
import re
from urllib.parse import urlparse

class PhishingDetector:
    """ML-based phishing detector using trained model"""
    
    def __init__(self, model_path=None):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.feature_names = [
            'sender_has_numeric', 'sender_domain_age_ratio', 'url_shortener',
            'suspicious_keywords', 'html_form_present', 'external_links_ratio',
            'script_tags_count', 'iframe_count', 'redirect_present',
            'encoding_obfuscation', 'typosquatting_score', 'domain_ip_mismatch',
            'tls_certificate_mismatch', 'excessive_redirects', 'email_reply_mismatch'
        ]
        
        # Load trained model if available
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            self._train_default_model()
    
    def _train_default_model(self):
        """Train a default model on synthetic data"""
        # Generate synthetic training data
        n_samples = 1000
        X_train = np.random.rand(n_samples, len(self.feature_names))
        # Create labels: higher feature values = more likely phishing
        y_train = (X_train.mean(axis=1) > 0.5).astype(int)
        
        # Train model
        self.model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
        self.model.fit(X_train, y_train)
        
        # Initialize scaler
        self.scaler = StandardScaler()
        self.scaler.fit(X_train)
    
    def load_model(self, path):
        """Load pre-trained model"""
        with open(path, 'rb') as f:
            model_data = pickle.load(f)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
    
    def extract_features(self, email_data):
        """Extract features from email"""
        sender = email_data.get('sender', '')
        subject = email_data.get('subject', '')
        body = email_data.get('body', '')
        html_content = email_data.get('html_content', '')
        
        features = {}
        
        # 1. Sender has numeric characters
        features['sender_has_numeric'] = float(any(c.isdigit() for c in sender.split('@')[0]))
        
        # 2. Sender domain age (simulated - in production would use WHOIS)
        domain = sender.split('@')[1] if '@' in sender else ''
        features['sender_domain_age_ratio'] = self._estimate_domain_age(domain)
        
        # 3. URL shortener usage
        features['url_shortener'] = float(any(short in body for short in ['bit.ly', 'tinyurl', 'goo.gl', 'ow.ly']))
        
        # 4. Suspicious keywords count
        suspicious_keywords = ['urgent', 'verify', 'confirm', 'update', 'act now', 'click here', 
                             'expire', 'suspend', 'unusual', 'alert', 'action required']
        keyword_count = sum(body.lower().count(kw) for kw in suspicious_keywords)
        features['suspicious_keywords'] = min(keyword_count / 10.0, 1.0)  # Normalize
        
        # 5. HTML form present
        features['html_form_present'] = float('<form' in html_content.lower())
        
        # 6. External links ratio
        links = re.findall(r'https?://[^\s]+', body + html_content)
        domain_links = sum(1 for link in links if domain in link)
        features['external_links_ratio'] = 1.0 - (domain_links / len(links) if links else 0)
        
        # 7. Script tags count
        script_count = html_content.lower().count('<script')
        features['script_tags_count'] = min(script_count / 5.0, 1.0)
        
        # 8. IFrame count
        iframe_count = html_content.lower().count('<iframe')
        features['iframe_count'] = min(iframe_count / 3.0, 1.0)
        
        # 9. Redirect present
        features['redirect_present'] = float('redirect' in html_content.lower() or 'location.href' in html_content.lower())
        
        # 10. Encoding/obfuscation
        features['encoding_obfuscation'] = float('&#' in html_content or '\\x' in html_content)
        
        # 11. Typosquatting score (simple check)
        known_domains = ['gmail', 'outlook', 'yahoo', 'microsoft', 'apple']
        typo_score = 0
        for known in known_domains:
            if domain and known in domain and domain != known + '.com':
                typo_score = 0.8
        features['typosquatting_score'] = typo_score
        
        # 12. Domain-IP mismatch (simulated)
        features['domain_ip_mismatch'] = float(self._check_ip_mismatch(domain))
        
        # 13. TLS certificate mismatch (simulated)
        features['tls_certificate_mismatch'] = float(self._check_tls_mismatch(domain))
        
        # 14. Excessive redirects
        redirects = html_content.lower().count('redirect')
        features['excessive_redirects'] = min(redirects / 5.0, 1.0)
        
        # 15. Email reply-to mismatch
        features['email_reply_mismatch'] = 0.0  # Would need reply-to header in real scenario
        
        return features
    
    def _estimate_domain_age(self, domain):
        """Estimate domain age (simulated)"""
        # In production, would query WHOIS
        # Simulated: older TLDs = higher score
        if domain:
            return 0.3 if domain.endswith('.com') else 0.7
        return 0.5
    
    def _check_ip_mismatch(self, domain):
        """Check if domain resolves to unexpected IP"""
        # In production: resolve domain, check against expected IPs
        return np.random.rand() > 0.7  # Simulated
    
    def _check_tls_mismatch(self, domain):
        """Check TLS certificate validity"""
        # In production: check certificate against domain
        return np.random.rand() > 0.8  # Simulated
    
    def detect(self, email_data):
        """Detect if email is phishing"""
        if not self.model or not self.scaler:
            raise ValueError("Model not trained or loaded")
        
        # Extract features
        features_dict = self.extract_features(email_data)
        
        # Convert to feature vector in correct order
        X = np.array([[features_dict.get(fname, 0.0) for fname in self.feature_names]])
        
        # Scale
        X_scaled = self.scaler.transform(X)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        probabilities = self.model.predict_proba(X_scaled)[0]
        confidence = probabilities[1]  # Confidence for phishing class
        
        # Determine risk level
        if confidence >= 0.8:
            risk_level = 'critical'
        elif confidence >= 0.6:
            risk_level = 'high'
        elif confidence >= 0.4:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        # Generate reasons
        reasons = self._generate_reasons(features_dict, confidence)
        
        return {
            'is_phishing': bool(prediction),
            'confidence_score': float(confidence),
            'risk_level': risk_level,
            'feature_scores': features_dict,
            'reasons': reasons
        }
    
    def _generate_reasons(self, features, confidence):
        """Generate human-readable reasons for detection"""
        reasons = []
        
        if features.get('suspicious_keywords', 0) > 0.5:
            reasons.append('Contains urgent/suspicious language')
        if features.get('url_shortener', 0) > 0.5:
            reasons.append('Uses URL shortener service')
        if features.get('html_form_present', 0) > 0.5:
            reasons.append('HTML form present (credential harvesting risk)')
        if features.get('external_links_ratio', 0) > 0.7:
            reasons.append('High ratio of external links')
        if features.get('script_tags_count', 0) > 0.3:
            reasons.append('Contains embedded scripts')
        if features.get('iframe_count', 0) > 0:
            reasons.append('Contains iframes')
        if features.get('encoding_obfuscation', 0) > 0:
            reasons.append('HTML encoding/obfuscation detected')
        if features.get('typosquatting_score', 0) > 0.5:
            reasons.append('Domain resembles known service (typosquatting)')
        
        if not reasons:
            reasons.append('Flagged by ML model pattern matching')
        
        return reasons
    
    def get_feature_importance(self):
        """Get feature importance from model"""
        if not self.model:
            return {}
        
        importances = self.model.feature_importances_
        return {name: float(importance) for name, importance in zip(self.feature_names, importances)}


# Global detector instance
detector = None

def get_detector():
    """Get or create detector instance"""
    global detector
    if detector is None:
        detector = PhishingDetector()
    return detector
