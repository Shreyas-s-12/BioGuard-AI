# NutriGuard AI 🛡️

Smart Food Safety & Chemical Risk Awareness Platform

**NutriGuard AI** is a hackathon-ready platform that analyzes packaged food labels to detect harmful chemicals, hidden sugars, and nutrition risks using OCR technology and a comprehensive chemical database.

![NutriGuard AI](https://img.shields.io/badge/NutriGuard-AI-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11+-yellow?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green?style=flat-square)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan?style=flat-square)

## ✨ Features

- 📷 **Food Label Scanner** - Upload images and extract text using Tesseract OCR
- 🔬 **Chemical Detection** - Detects 300+ real food additives and E-numbers
- 🍬 **Hidden Sugar Detection** - Identifies 60+ sugar aliases and alternative names
- 📊 **Health Risk Scoring** - Calculates 0-100 risk score based on multiple factors
- 📋 **Nutrition Analysis** - Analyzes sugar, sodium, fat, and calorie content
- 💡 **Smart Recommendations** - Provides actionable food safety recommendations

## 🏗️ System Architecture

```
User uploads image
        ↓
OCR extracts ingredients (Tesseract)
        ↓
Ingredient analyzer checks database
        ↓
Chemical intelligence engine detects additives
        ↓
Hidden sugar detection identifies aliases
        ↓
Nutrition analyzer checks risk thresholds
        ↓
Risk scoring engine calculates score
        ↓
Frontend dashboard displays results
```

## 🛠️ Tech Stack

### Backend
- **Python 3.11+** - Core language
- **FastAPI** - REST API framework
- **Tesseract OCR** - Text extraction from images
- **Pillow** - Image processing
- **Pandas** - Data handling
- **PyYAML** - Configuration management

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Vite** - Build tool

## 📁 Project Structure

```
NutriGuard-AI/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── config.yaml          # Configuration (risk weights, thresholds)
│   ├── requirements.txt     # Python dependencies
│   └── data/
│       ├── chemicals.csv    # 300+ food additives database
│       └── sugar_aliases.json # 60+ sugar aliases
├── frontend/
│   ├── package.json         # Node dependencies
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind configuration
│   ├── index.html          # Entry HTML
│   └── src/
│       ├── main.jsx        # React entry
│       ├── App.jsx         # Main application
│       └── index.css       # Global styles
├── README.md               # This file
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites

1. **Python 3.11+** - [Download](https://www.python.org/downloads/)
2. **Node.js 18+** - [Download](https://nodejs.org/)
3. **Tesseract OCR** - [Download](https://github.com/UB-Mannheim/tesseract/wiki)

### Installation

#### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 2. Install Tesseract OCR

**Windows:**
- Download installer from [UB-Mannheim/tesseract](https://github.com/UB-Mannheim/tesseract/wiki)
- Install to default location: `C:\Program Files\Tesseract-OCR`
- Add to PATH

**macOS:**
```bash
brew install tesseract
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

#### 3. Start Backend Server

```bash
cd backend
python main.py
```

The API will start at `http://localhost:8000`

#### 4. Setup Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check with database stats |
| `/api/analyze` | POST | Analyze food (image or text) |
| `/api/ocr` | POST | Perform OCR on image |
| `/api/chemicals` | GET | Get chemicals with filters |
| `/api/categories` | GET | Get all chemical categories |

## 🔧 Configuration

Risk weights and thresholds can be adjusted in `backend/config.yaml`:

```yaml
risk_weights:
  sugar_risk: 30      # Sugar contribution to risk
  fat_risk: 25       # Fat contribution to risk
  sodium_risk: 20    # Sodium contribution to risk
  chemical_risk: 15  # Chemical contribution to risk
  processing_risk: 10 # Processing level contribution

nutrition_thresholds:
  sugar:
    low: 5
    medium: 15
    high: 25
  # ... more thresholds
```

## 📊 Risk Scoring Algorithm

The health risk score (0-100) is calculated using weighted factors:

```
Overall Score = (
  Sugar Risk × 30% +
  Fat Risk × 25% +
  Sodium Risk × 20% +
  Chemical Risk × 15% +
  Processing Level × 10%
)
```

Risk Levels:
- **0-39**: 🟢 Low Risk
- **40-69**: 🟡 Moderate Risk
- **70-100**: 🔴 High Risk

## 🔬 Chemical Database

The system includes 300+ real food additives from categories:
- Preservatives
- Artificial Colors
- Artificial Sweeteners
- Flavor Enhancers
- Emulsifiers
- Antioxidants
- Thickeners
- And more...

## 💡 Usage Examples

### Via Image Upload

1. Click "Select Image" or drag a food label image
2. The system performs OCR to extract ingredients
3. Chemical analysis runs automatically
4. View risk score and detailed report

### Via Manual Input

1. Enter ingredients comma-separated
2. Optionally add nutrition values
3. Click "Analyze Food"
4. View complete analysis

## 🎯 Demo Data

Example ingredients to test:

```text
Water, Sugar, High Fructose Corn Syrup, Sodium Benzoate, 
Potassium Sorbate, Citric Acid, Artificial Flavor, 
Caramel Color, Phosphoric Acid, Caffeine
```

This should detect:
- High fructose corn syrup (hidden sugar)
- Sodium benzoate (preservative)
- Potassium sorbate (preservative)
- Caramel color (artificial color)
- Phosphoric acid (acidulant)

## 🐛 Troubleshooting

### Tesseract not found
Ensure Tesseract is installed and in your PATH. On Windows, you may need to set the path in code:

```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

### CORS errors
The frontend is configured to proxy API requests. If you see CORS errors, ensure the backend is running on port 8000.

### OCR quality
For better OCR results:
- Use clear, high-resolution images
- Ensure good lighting
- Avoid blurry or low-contrast images

## 📝 License

This project is for educational purposes. Food safety decisions should be made in consultation with healthcare professionals.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**NutriGuard AI** - Making food safety accessible to everyone! 🛡️
