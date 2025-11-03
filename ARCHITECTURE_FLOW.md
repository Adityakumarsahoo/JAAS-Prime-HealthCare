# JAAS Prime HealthCare — System Flow (Frontend ↔ Backend)

Below is a high-level flowchart of the main interactions across the frontend and backend. The diagram is written in Mermaid so you can render it in many tools (GitHub, VSCode extensions, Mermaid Live Editor).

```mermaid
flowchart LR
  %% Frontend Areas
  subgraph FE[Frontend]
    FE_Login[Login.jsx]
    FE_Doctors[Doctors.jsx / AppContext]
    FE_Appointment[Appointment.jsx (/appointment/:docId)]
    FE_PatientDash[PatientDashboard.jsx]
    FE_DoctorDash[DoctorDashboard.jsx]
    FE_AdminDash[Admin Dashboard.jsx]
    FE_AdminPages[Admin Appointments/Doctors/Patients]
    FE_Services[UserService.jsx (axios instance)]
  end

  %% Backend Areas
  subgraph BE[Backend]
    BSEC[SecurityConfig + JWT Filter]
    BAUTHC[AuthController (/api/auth)]
    BAUTHS[AuthServiceImpl]
    BJWTS[JwtService]
    BDC[DoctorController (/api/doctors)]
    BPSC[PatientController (/api/patients)]
    BAC[AppointmentController (/api/appointments)]
    BADMC[AdminController (/api/admin)]
    BDAOs[DoctorDao / PatientDao / AppointmentDao]
    BSVCs[DoctorServiceImpl / PatientServiceImpl / AppointmentServiceImpl]
    BEVT[EventStreamService (SSE)]
  end

  %% Base URL and Token
  FE_Services -- baseURL: VITE_BACKEND_URL → BE
  FE_Services -- attaches Authorization: Bearer aToken → BE

  %% Authentication Flow
  FE_Login -- POST /api/auth/login → BAUTHC
  BAUTHC --> BAUTHS
  BAUTHS -->|Valid user| BJWTS
  BJWTS -->|JWT issued| FE_Login
  FE_Login -->|stores aToken, role| FE_Services
  BAUTHS -->|Admin via properties| BJWTS

  %% Registration
  FE_Login -- POST /api/auth/register (role: PATIENT/DOCTOR) → BAUTHC
  BAUTHC --> BAUTHS
  BAUTHS --> BDAOs
  BDAOs -->|persist user| FE_Login

  %% Doctors Listing
  FE_Doctors -- GET /api/doctors → BDC
  BDC --> BSVCs
  BSVCs --> BDAOs
  BDAOs -->|list doctors| FE_Doctors
  FE_Doctors -->|navigate| FE_Appointment

  %% Appointment Booking
  FE_Appointment -- POST /api/appointments/book {doctorId,date,time} → BAC
  BAC --> BSVCs
  BSVCs --> BDAOs
  BDAOs -->|save appointment (PENDING)| BAC
  BAC -->|emit 'appointment_booked'| BEVT
  BEVT -->|SSE| FE_AdminDash

  %% Patient Views
  FE_PatientDash -- GET /api/patients/profile → BPSC
  FE_PatientDash -- GET /api/appointments/me → BAC
  BAC --> BSVCs --> BDAOs --> FE_PatientDash

  %% Doctor Views
  FE_DoctorDash -- GET /api/appointments/doctor/me → BAC
  BAC --> BSVCs --> BDAOs --> FE_DoctorDash

  %% Admin Views and Management
  FE_AdminPages -- GET /api/appointments → BAC
  FE_AdminPages -- PUT /api/appointments/{id}/status?status=APPROVED|REJECTED → BAC
  BAC --> BSVCs --> BDAOs
  FE_AdminPages -- GET /api/admin/doctors → BADMC
  BADMC --> BSVCs --> BDAOs
  FE_AdminPages -- GET /api/admin/users → BADMC
  FE_AdminPages -- GET /api/admin/patients/pending → BADMC
  FE_AdminDash -- GET /api/admin/events (SSE) → BADMC

  %% Security and Roles
  FE_Services --> BSEC
  BSEC -->|Authorize by role: ADMIN/DOCTOR/PATIENT| BE

```

Notes
- Frontend base URL: `VITE_BACKEND_URL` (fallback `http://localhost:8080`). Axios instance attaches `aToken` to every request.
- Role-based access from `SecurityConfig`:
  - `/api/admin/**` → ADMIN
  - `/api/doctors/**` → ADMIN, DOCTOR (doctor listing may also be exposed publicly in some views)
  - `/api/appointments/book` → PATIENT; `/api/appointments/**` → ADMIN, DOCTOR, PATIENT
  - `/api/patients/**` → ADMIN, PATIENT
- Appointment status updates use `PUT /api/appointments/{id}/status?status=APPROVED|REJECTED` by assigned doctor or admin, enforced via `AppointmentController` + `SecurityContext` checks.
- Real-time updates:
  - `EventStreamService` emits booking events; Admin dashboard subscribes to `/api/admin/events`.
  - Patient dashboard subscribes to `/api/patient/events` (configured client-side for notifications).

Known Integration Notes
- Ensure the frontend’s `bookAppointment` uses the backend path `/api/appointments/book`.
- Admin may read appointments via `/api/appointments` (all roles allowed) if `/api/admin/appointments` is not present.
- Doctor IDs are numeric in backend; frontend normalizes `_id` from `id` when listing.