# 🚀 CodeForge – AI-Powered Collaborative Code Hosting & version control Platform



---

## 📌 Overview

**CodeForge** is a next-generation AI-powered collaborative development platform inspired by GitHub, enhanced with intelligent automation and modern developer tools.

The platform enables developers to create repositories, upload and edit source code directly in the browser, manage projects collaboratively, and leverage Artificial Intelligence to generate websites and accelerate development.

Beyond traditional repository hosting, CodeForge aims to become an all-in-one ecosystem for software development by combining version control, collaboration, AI assistance, and cloud-native development workflows.

---

# ❓ Problem Statement

Developers today rely on multiple disconnected platforms for software development:

* GitHub for source code management
* VS Code for editing
* ChatGPT/Gemini for AI assistance
* Vercel or Netlify for deployment
* Jira/Trello for project management
* Slack/Discord for collaboration

Switching between multiple platforms reduces productivity, increases complexity, and creates fragmented workflows.

### Our Solution

CodeForge unifies these workflows into a single intelligent platform where developers can:

* Create and manage repositories
* Edit code online
* Collaborate with team members
* Manage commits
* Discover developers
* Follow other developers
* Receive real-time notifications
* Generate websites using AI
* Build modern applications from one platform

---

# 🎯 Objectives

* Simplify collaborative software development
* Integrate AI into the development workflow
* Build an intuitive GitHub-inspired ecosystem
* Improve developer productivity
* Enable efficient project collaboration
* Create a scalable platform for future cloud deployment

---

# ✨ Current Features

## 👤 User Management

* Secure Authentication
* User Registration
* Login System
* JWT Authentication
* Protected Routes
* User Profiles

---

## 📁 Repository Management

* Create Repository
* Delete Repository
* Repository Dashboard
* Public Profile
* Repository Details
* Repository Navigation

---

## 📂 File Management

* Upload Files
* View Files
* Edit Files
* Monaco Code Editor Integration
* Save Changes
* File Explorer

---

## 📝 Version Control

* Commit Changes
* Commit History
* Track Repository Updates

---

## 🤖 AI Website Generator

Integrated Google Gemini AI allows users to generate complete website structures directly from natural language prompts.

Features include:

* HTML Generation
* CSS Generation
* JavaScript Generation
* AI Project Scaffolding
* Instant Code Generation

---

## 🌐 Developer Network

* Search Developers
* Public Profiles
* Follow Request System
* Accept/Reject Requests
* Followers
* Following
* User Discovery

---

## 🔔 Notification System

* Real-time Notifications
* Follow Requests
* Follow Acceptance
* Follow Rejection
* Read/Unread Status

---

# 🏗 Initial System Architecture

```
                     +----------------------+
                     |      Frontend        |
                     | React + Redux + Vite |
                     +----------+-----------+
                                |
                                |
                            Axios API
                                |
                                |
+--------------------------------------------------------+
|                    Express.js Backend                  |
|--------------------------------------------------------|
| Authentication                                         |
| Repository APIs                                        |
| File APIs                                              |
| Commit APIs                                            |
| Notification APIs                                      |
| User APIs                                              |
| AI Services                                            |
+-----------------------+--------------------------------+
                        |
                        |
                    Mongoose
                        |
                        |
                +----------------+
                |   MongoDB      |
                +----------------+
                        |
                        |
                Google Gemini AI
```

---

# 📂 Project Structure

```
CodeForge

├── frontend
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── api
│   ├── features
│   ├── utils
│   ├── styles
│   ├── store.js
│   └── AppRoutes.jsx
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── routes
│   ├── services
│   ├── validators
│   ├── models
│   ├── utils
│   └── app.js
│
└── docker-compose.yml
```

---

# ⚙️ Tech Stack

## Frontend

* React.js
* Vite
* Redux Toolkit
* React Router
* Axios
* Tailwind CSS
* Monaco Editor

---

## Backend

* Node.js
* Express.js
* REST API
* JWT Authentication
* Express Validator

---

## Database

* MongoDB
* Mongoose ODM

---

## Artificial Intelligence

* Google Gemini API

---

## Development Tools

* Git
* GitHub
* Docker
* VS Code
* Postman

---

# 🛠 Development Workflow

```
User

↓

Authentication

↓

Create Repository

↓

Upload Code

↓

Edit Files

↓

Commit Changes

↓

AI Assistance

↓

Collaborate

↓

Notifications

↓

Project Management
```

---

# 👥 Team Members & Responsibilities

## 👨‍💻 Sabarni Mukherjee

### Frontend Development

* Complete Frontend Architecture
* React Application Development
* UI/UX Design
* Responsive Interface
* State Management
* React Components
* Routing
* Tailwind CSS Integration
* Frontend Feature Implementation
* Frontend–Backend Integration Support

---

## 👩‍💻 Urmi Paul

### Backend Development

* Backend Architecture
* REST API Development
* MongoDB Database Design
* Database Management
* API Integration
* Express Server Implementation
* Authentication APIs
* Backend Services
* Backend Logic Optimization

---

# 🔄 Development Methodology

* Modular Architecture
* Component-Based Development
* RESTful API Design
* Layered Backend Architecture
* Reusable Components
* Scalable Folder Structure
* Clean Code Principles

---

# 🚀 Future Roadmap

The platform is designed to evolve into a complete collaborative development ecosystem.

Planned features include:

* ⭐ Repository Stars
* 🍴 Repository Forking
* 🔀 Pull Requests
* 🐛 Issue Tracking
* 🌿 Branch Management
* 📊 Developer Analytics Dashboard
* 🚀 One-Click Deployment
* 🤝 Live Collaborative Coding
* 💬 Team Collaboration
* 🤖 AI Code Review
* 🧠 AI Debugging Assistant
* 📄 Automatic Documentation Generation
* ☁ Cloud IDE
* 📦 CI/CD Integration
# 🎯 Vision
Our vision is to transform CodeForge into an intelligent, AI-assisted collaborative software development platform that combines the strengths of repository management, cloud development, and modern AI tools into a single seamless experience.

Instead of switching between multiple platforms, developers can build, collaborate, manage, and innovate—all from one place.
# 📜 License

This project is intended for academic learning, research, innovation, and collaborative software development.
</p>

