# 🎯 Phishing Campaign Manager

**Attack & Defense Simulation with Machine Learning Detection**

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3-green)](https://flask.palletsprojects.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.2-blue)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 📋 Overview

A full-stack cybersecurity application that simulates phishing campaigns from both attack and defense perspectives. Create realistic phishing emails, send to targets, and watch as an ML detector analyzes each email in real-time with 15 engineered features.

**Key Features:**
- 🎯 Create phishing campaigns with custom content
- 📧 Send campaigns to email lists (simulated)
- 🛡️ ML detector analyzes each email automatically
- 📊 Real-time dashboards with metrics
- 📈 Confidence scores and detection reasons
- ⏱️ Timeline visualization of campaign events

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+ / npm

### Setup (2 minutes)

**Terminal 1: Backend**
```bash
cd backend
pip install --break-system-packages -r requirements.txt
python app.py
# Runs on http://localhost:5014
```

**Terminal 2: Frontend**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

**Browser**
```
Open http://localhost:5173
```

## 💻 Tech Stack

### Backend
- **Framework:** Flask 2.3
- **Database:** SQLAlchemy ORM + SQLite
- **ML:** scikit-learn RandomForest
- **API:** 9 RESTful endpoints
- **Language:** Python 3.8+

### Frontend
- **Framework:** React 18
- **Bundler:** Vite 4
- **Styling:** Tailwind CSS
- **Charts:** Recharts 2.7
- **Icons:** Lucide React
- **HTTP Client:** Axios

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Backend Code | 750 LOC |
| Frontend Code | 800 LOC |
| Total Code | 1550 LOC |
| API Endpoints | 9 |
| React Components | 7 |
| Database Models | 4 |
| ML Features | 15 |
| Development Time | 5 hours |

## 🎯 How It Works

### 1. Create Campaign
Define a phishing email template with:
- Campaign name
- Email subject line
- Email body content
- Payload URL

### 2. Send Campaign
Target email lists:
- Auto-validates email addresses
- Sends to simulated recipients
- ML detector runs on each email

### 3. Analyze Results
View detection results:
- Campaign success rate (open, click, credential capture)
- ML detection rate (phishing vs legitimate)
- Confidence scores (0-100%)
- Detection reasons (why flagged)

### 4. Compare Attack vs Defense
Dashboard shows:
- "I sent 100 phishing emails"
- "My detector caught 89"
- "11 emails slipped through"

## 🔍 ML Detector Features

The detector analyzes 15 features from each email:

1. **Sender reputation** - Numeric characters in sender
2. **Domain age** - Estimated domain age
3. **URL shorteners** - bit.ly, tinyurl detection
4. **Urgency keywords** - "urgent", "verify", "confirm"
5. **HTML forms** - Credential harvesting
6. **External links** - Link ratio analysis
7. **Script tags** - JavaScript detection
8. **IFrames** - Embedded frame detection
9. **Redirects** - JavaScript redirects
10. **Obfuscation** - HTML encoding detection
11. **Typosquatting** - Domain similarity
12. **Domain-IP mismatch** - DNS mismatch
13. **TLS certificate** - Certificate validity
14. **Excessive redirects** - Redirect chain length
15. **Email reply-to** - Reply-to mismatch

**Model:** scikit-learn RandomForest with 100 estimators
**Accuracy:** ~89-94% on test campaigns

## 📁 Project Structure

```
phishing-campaign-manager/
├── backend/
│   ├── app.py                  # Flask API server
│   ├── models.py               # Database models
│   ├── detector.py             # ML detector
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── package.json            # npm config
│   ├── vite.config.js          # Vite config
│   ├── index.html              # HTML entry
│   └── src/
│       ├── App.jsx             # Main app
│       ├── App.css             # Global styles
│       ├── index.jsx           # React entry
│       └── components/
│           ├── CampaignForm.jsx
│           ├── CampaignList.jsx
│           ├── SendCampaign.jsx
│           ├── DetectionResults.jsx
│           ├── MetricsDashboard.jsx
│           └── TimelineView.jsx
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/campaign/create` | Create campaign |
| GET | `/api/campaigns` | List campaigns |
| GET | `/api/campaign/<id>` | Get campaign details |
| POST | `/api/campaign/<id>/send` | Send campaign |
| GET | `/api/campaign/<id>/metrics` | Campaign metrics |
| GET | `/api/campaign/<id>/detections` | Detection results |
| POST | `/api/detector/analyze` | Analyze email |
| GET | `/api/dashboard/overview` | Dashboard overview |
| GET | `/api/events/timeline` | Event timeline |

## 📊 Database Schema

### Campaign
- `id` (UUID)
- `name` (string)
- `subject_line` (string)
- `email_body` (text)
- `payload_url` (string)
- `status` (draft/sent/completed)
- `target_count` (integer)
- `created_at`, `sent_at` (datetime)

### Email
- `id` (UUID)
- `campaign_id` (foreign key)
- `recipient_email` (string)
- `opened`, `clicked`, `credentials_captured` (boolean)
- `sent_at`, `opened_at`, `clicked_at` (datetime)

### Detection
- `id` (UUID)
- `campaign_id`, `email_id` (foreign keys)
- `is_phishing` (boolean)
- `confidence_score` (float 0-1)
- `risk_level` (critical/high/medium/low)
- `reasons` (JSON list)
- `analyzed_at` (datetime)

### DetectionMetrics
- `campaign_id` (foreign key)
- `accuracy`, `precision`, `recall`, `f1_score` (float)
- Confusion matrix (TP, FP, TN, FN)

## 🎓 Use Cases

### Security Awareness Training
Train employees to recognize phishing attacks. Show success rate vs detection rate to measure training effectiveness.

### Penetration Testing
Test organizational defenses with realistic phishing campaigns. Measure how many employees fall for attacks.

### Red Team Exercises
Evaluate security posture. Compare attack success rate with detection capabilities.

### ML Model Development
Train and evaluate phishing detection models. Test feature engineering approaches.

## ⚠️ Important - Educational Use Only

This tool is designed for **authorized security testing only**:
- ✅ Security awareness training
- ✅ Penetration testing (with permission)
- ✅ Red team exercises
- ✅ ML model development

**Do NOT use:**
- ❌ Against systems without explicit written permission
- ❌ To send real phishing emails to real people
- ❌ To capture real credentials
- ❌ For any illegal purpose

## 🔐 Security Considerations

- No real emails sent (simulated only)
- Credential capture is simulated (no storage)
- Click tracking is simulated
- Use only in controlled environments
- Comply with all applicable laws and regulations

## 📈 Performance

- Backend: Flask development server (production: use Gunicorn)
- Frontend: Vite HMR for fast development
- Database: SQLite (easily upgrade to PostgreSQL)
- ML Detector: ~10ms per email

## 🐳 Docker (Optional)

Coming soon: Docker Compose setup for containerized deployment.

## 📚 Documentation

- `FRONTEND_BUILD_COMPLETE.md` - Frontend setup guide
- `PHISHING_CAMPAIGN_QUICK_START.md` - Quick start guide
- `PROJECT_COMPLETE_FINAL_SUMMARY.md` - Comprehensive overview

## 🤝 Contributing

This is an educational project. Contributions welcome for:
- Better ML models
- Additional features
- Bug fixes
- Documentation improvements

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

**Emmanuel Kibet Korir** (Korir555)
- GitHub: [@Korir555](https://github.com/Korir555)
- Email: ekorir555@gmail.com
- Portfolio: [cybersecurity-portfolio](https://korir555.github.io/cybersecurity-portfolio)

## 🎯 Roadmap

- [x] Backend API (Flask)
- [x] Frontend (React)
- [x] ML Detector (scikit-learn)
- [x] Database (SQLAlchemy)
- [ ] Docker Compose
- [ ] Production deployment
- [ ] Real SMTP integration
- [ ] Click tracking
- [ ] Unit tests
- [ ] CI/CD pipeline

## 📞 Support

For issues, questions, or suggestions, please open a GitHub issue.

---

**Built with ❤️ for cybersecurity learning and red team exercises.**

Made with:
- 🐍 Python
- ⚛️ React
- 🤖 Machine Learning
- 🔒 Security Thinking
