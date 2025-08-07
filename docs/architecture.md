# 🏗️ System Architecture – DropOffLens

_This document explains the high-level architecture of DropOffLens in simple, non-technical terms. It is written from a product management perspective._

---

## 🔍 Overview

DropOffLens is a lightweight web application that helps SaaS startups quickly understand **why users churn** by analyzing exit feedback using AI (GPT). Users can paste or upload CSV feedback, and the tool instantly returns clear churn themes, user quotes, and actionable product suggestions — exportable in PDF format.

---

## 🧩 Major Components

### 1. 🎨 Frontend (User Interface)

- **Framework**: React  
- **Styling**: Tailwind CSS

**Responsibilities**:
- Allows users to:
  - Upload `.csv` or paste feedback
  - Click "Analyze Feedback"
  - View churn themes, quote examples, and suggestions
  - Export insights as a one-page PDF
- Clean, minimal UI for speed and clarity

---

### 2. 🤖 Backend (AI & Data Processing)

- **Runtime**: Node.js  
- **AI**: OpenAI GPT API  
- **File Parsing**: PapaParse (for CSVs)

**Responsibilities**:
- Receives raw feedback from frontend
- Processes input using GPT to:
  - Group similar feedback into churn themes
  - Extract supporting quotes
  - Generate actionable product suggestions
- Sends results back to frontend for display

---

### 3. 📄 PDF Report Generator

- **Tool**: jsPDF or PDFKit

**Responsibilities**:
- Takes final insights and themes
- Creates a downloadable 1-page report
- Enables easy sharing across the startup team

---

### 4. 🚀 Hosting & Deployment

- **Platform**: Replit  
- **Reason**: Fast to build, no manual server setup, ideal for solo makers and MVPs

---

## 🔁 System Flow (Simplified)

```plaintext
User → React Frontend → Node.js Backend → GPT → Themed Insights → PDF Download

Tools & Libraries Used:

| Tool / Library | Role in System                         |
| -------------- | -------------------------------------- |
| React          | Frontend UI framework                  |
| Tailwind CSS   | Styling and layout                     |
| Node.js        | Backend logic and API handling         |
| OpenAI GPT API | Clustering + summarization of feedback |
| PapaParse      | CSV file parsing                       |
| jsPDF / PDFKit | PDF generation of insights             |
| Replit         | Hosting and live deployment            |


Privacy & Simplicity:
- No login/account needed in MVP
- No user data is stored – feedback is processed temporarily
- AI-generated themes and insights are shown instantly, no saving

Future Enhancements (Post-MVP):

| Area                   | Planned Improvement                          |
| ---------------------- | -------------------------------------------- |
| 🧑‍🤝‍🧑 Collaboration | Add user logins and multi-user support       |
| 🔌 Integrations        | Connect to Intercom, Typeform, Google Forms  |
| 📊 Analytics           | Dashboard with historical churn insights     |
| 🧠 Smarter AI          | Retention playbooks personalized per startup |
| ☁️ Storage             | Store past reports and insights securely     |

Why This Architecture Works:
- Fast, AI-first analysis
- Simple user experience
- No unnecessary complexity for early users
- Fully extensible in future versions
