# JAAS-Prime-HealthCare
JAAS Prime HealthCare is a comprehensive Hospital Management System (HMS) built with a modern full-stack architecture using React (Vite) on the frontend and Spring Boot + MySQL on the backend. It enables patients, doctors, and administrators to interact seamlessly — from booking appointments to managing healthcare operations with real-time updates.

# 🏥 JAAS Prime HealthCare  
### A Complete Full-Stack Hospital Management System  

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Security-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

> 💡 A secure and scalable hospital management platform that connects **Patients, Doctors, and Admins** with real-time event updates — built using **React (Vite)** + **Spring Boot (Java)** + **MySQL**.

---

## 🧠 Overview  
**JAAS Prime HealthCare** is a full-stack healthcare management solution that streamlines the interaction between patients, doctors, and admins.  
It supports:
- Appointment booking and tracking  
- Doctor and patient management  
- Real-time admin notifications using **SSE (Server-Sent Events)**  
- Role-based secure login with **JWT Authentication**

---

## ⚙️ Tech Stack
| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js (Vite), Context API, Axios, React Router |
| **Backend** | Spring Boot, Spring Security (JWT), REST API, JPA / Hibernate |
| **Database** | MySQL |
| **Tools** | Postman, Maven, SSE, VS Code / IntelliJ |

---

## ✨ Key Features

### 👩‍⚕️ Patients
- Register, login, and update profiles  
- Browse doctors by specialization  
- Book and manage appointments  
- View appointment history & status  

### 🧑‍⚕️ Doctors
- Secure doctor login & profile management  
- View and manage assigned appointments  
- Approve / Reject appointment requests  

### 🧑‍💼 Admin
- Manage doctors, patients, and appointments  
- Real-time updates through SSE (live notifications)  
- View and monitor appointment statistics  

---

## 🔐 Security & Access Control
- **JWT Authentication** for all protected routes  
- **Role-based authorization** through Spring Security  

| Role | Access Rights |
|------|----------------|
| **Admin** | Full access to all resources |
| **Doctor** | Manage appointments & profile |
| **Patient** | Book appointments & view records |

---

## 🧩 API Overview

| Method | Endpoint | Description | Role |
|--------|-----------|-------------|------|
| POST | `/api/auth/login` | Authenticate user | Public |
| POST | `/api/auth/register` | Register patient/doctor | Public |
| GET | `/api/doctors` | List all doctors | All |
| POST | `/api/appointments/book` | Book new appointment | PATIENT |
| PUT | `/api/appointments/{id}/status` | Approve / Reject appointment | DOCTOR / ADMIN |
| GET | `/api/admin/events` | Live events stream (SSE) | ADMIN |

---

## 🧭 System Architecture (Frontend ↔ Backend)

Below is the full interaction flow between **React Frontend** and **Spring Boot Backend**:

  FE_AdminPages -- GET /api/admin/patients/pending → BADMC
  FE_AdminDash -- GET /api/admin/events (SSE) → BADMC

  FE_Services --> BSEC
  BSEC -->|Authorize by role: ADMIN/DOCTOR/PATIENT| BE

