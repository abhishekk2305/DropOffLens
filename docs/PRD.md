# 📄 Product Requirements Document (PRD)

_Last updated: August 2025 — Version 1.0 (MVP)_

---

## ✨ Product Name  
**DropOffLens**  
> _AI-Powered Churn Insight for SaaS Teams_

---

## 🧠 Problem Statement  

Early-stage SaaS startups often fail to understand **why users churn**. Exit feedback is scattered across emails, chats, and feedback forms — rarely structured or analyzed. As a result:

- Teams lack visibility into real churn reasons
- The same mistakes are repeated
- Retention remains stagnant or worsens

This leads to missed growth opportunities, wasted development cycles, and frustration among founders and product teams.

---

## 🎯 Product Goal  

To build a lean, AI-powered tool that helps startups:

- Collect user exit feedback
- Automatically cluster it into **themes**
- Generate **actionable product suggestions**
- Export results in a report

All in **under 60 seconds** — replacing the manual, tedious process with clarity.

---

## 🧑‍💼 Target Users

- **SaaS startup founders** (teams of 5–50)
- **Product managers** focused on retention
- **Growth/Customer success teams** analyzing exit feedback

---

## 💡 Core Value Proposition  

> “Understand *why users leave* in 30 seconds — not 3 hours.”

---

## 🧪 MVP Feature Scope (V1)

✅ **Input Methods**
- Paste churn feedback directly  
- Upload `.csv` file (text column)

✅ **AI Processing**
- GPT clusters feedback into common churn themes  
- Top reasons surfaced: e.g., pricing, bugs, onboarding, support

✅ **Insights Display**
- Shows top themes, sample user quotes  
- AI-generated suggestions for each cluster

✅ **Export**
- Download summary report as PDF

---

## 🚫 Out of Scope (V1)

- User accounts, login, multi-user roles  
- CRM or 3rd-party integrations (Intercom, Slack, etc.)  
- Multi-language support  
- Real-time team collaboration

---

## 🔁 Core User Flows

1. **Submit Feedback**  
   - User pastes or uploads feedback in bulk

2. **AI Processing**  
   - GPT processes and clusters into thematic buckets

3. **View Insights**  
   - Dashboard displays themes, frequency, and examples  
   - Suggestions shown per theme

4. **Export Report**  
   - One-click PDF export for sharing or internal analysis

---

## 📊 Success Metrics

- ⏱ **Time-to-insight < 60 seconds**  
- 🧠 **# of churn reasons clustered per session**  
- 📄 **# of reports exported by users**  
- ✅ **GPT vs human thematic overlap (%)**

---

## 🧭 Future Roadmap (Post-MVP)

- Integrate with Google Forms / Intercom / Zendesk  
- Support direct copy-paste from user interviews  
- Custom tagging and annotation  
- Save sessions and create shareable links  
- Personalized product suggestions based on company size/stage  
- Dashboard analytics (month-wise churn themes)

---

## 💬 Stakeholder Quotes

> “We ask users why they leave… but no one reads that stuff unless someone manually makes a chart.”  
— *PM at 10-person SaaS startup*  

> “I just want to know what to fix *now* to stop people from quitting.”  
— *Founder, Seed-stage startup*

---

## 🧰 Tech Notes

- Frontend: React + Tailwind (via Replit)
- Backend: Node.js
- AI: OpenAI GPT (theme clustering + suggestions)
- Hosting: Replit
- Export: PDF generation

---

