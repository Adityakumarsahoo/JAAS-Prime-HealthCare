package com.excelR.JAASPrimeHealthCare.controller;

import com.excelR.JAASPrimeHealthCare.entity.Appointment;
import com.excelR.JAASPrimeHealthCare.entity.Doctor;
import com.excelR.JAASPrimeHealthCare.entity.Patient;
import com.excelR.JAASPrimeHealthCare.service.AppointmentService;
import com.excelR.JAASPrimeHealthCare.service.DoctorService;
import com.excelR.JAASPrimeHealthCare.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final com.excelR.JAASPrimeHealthCare.service.EventStreamService eventStreamService;

    public AppointmentController(AppointmentService appointmentService, PatientService patientService, DoctorService doctorService, com.excelR.JAASPrimeHealthCare.service.EventStreamService eventStreamService) {
        this.appointmentService = appointmentService;
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.eventStreamService = eventStreamService;
    }

    // Get all appointments
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    // Book a new appointment
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(
            @RequestBody AppointmentRequest request,
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Not authenticated"));
            }

            appointmentService.bookAppointment(
                    request.getDoctorId(),
                    principal.getName(),
                    request.getDate(),
                    request.getTime());

            // Emit booking event
            try {
                java.util.Map<String, Object> evt = new java.util.HashMap<>();
                evt.put("type", "appointment_booked");
                evt.put("doctorId", request.getDoctorId());
                evt.put("patientEmail", principal.getName());
                evt.put("date", request.getDate());
                evt.put("time", request.getTime());
                evt.put("status", "PENDING");
                eventStreamService.emit(evt);
            } catch (Exception ignored) {}

            return ResponseEntity.ok(new ApiResponse(true, "Appointment booked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Get appointments for the current authenticated patient
    @GetMapping("/me")
    public ResponseEntity<?> getMyAppointments(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Not authenticated"));
            }

            String email = principal.getName();
            Patient patient = patientService.findByEmail(email).orElse(null);
            if (patient == null) {
                return ResponseEntity.ok(java.util.Collections.emptyList());
            }

            List<Appointment> appts = appointmentService.getAppointmentsByPatient(patient.getId());
            List<Map<String, Object>> response = appts.stream().map(a -> {
                Map<String, Object> doctor = new HashMap<>();
                if (a.getDoctor() != null) {
                    doctor.put("id", a.getDoctor().getId());
                    doctor.put("fullName", a.getDoctor().getFullName());
                    doctor.put("name", a.getDoctor().getFullName());
                    doctor.put("speciality", a.getDoctor().getSpeciality());
                    doctor.put("image", a.getDoctor().getImage());
                    doctor.put("fees", a.getDoctor().getFees());
                }

                Map<String, Object> patientMap = new HashMap<>();
                if (a.getPatient() != null) {
                    patientMap.put("id", a.getPatient().getId());
                    patientMap.put("fullName", a.getPatient().getFullName());
                    patientMap.put("email", a.getPatient().getEmail());
                }

                Map<String, Object> item = new HashMap<>();
                item.put("id", a.getId());
                item.put("date", a.getDate());
                item.put("time", a.getTime());
                item.put("status", a.getStatus());
                item.put("doctor", doctor);
                item.put("patient", patientMap);
                return item;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Get appointments for the current authenticated doctor
    @GetMapping("/doctor/me")
    public ResponseEntity<?> getMyDoctorAppointments(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Not authenticated"));
            }

            String email = principal.getName();
            Doctor doctor = doctorService.findByEmail(email).orElse(null);
            if (doctor == null) {
                return ResponseEntity.ok(java.util.Collections.emptyList());
            }

            List<Appointment> appts = appointmentService.getAppointmentsByDoctor(doctor.getId());
            List<Map<String, Object>> response = appts.stream().map(a -> {
                Map<String, Object> doctorMap = new HashMap<>();
                if (a.getDoctor() != null) {
                    doctorMap.put("id", a.getDoctor().getId());
                    doctorMap.put("fullName", a.getDoctor().getFullName());
                    doctorMap.put("name", a.getDoctor().getFullName());
                    doctorMap.put("speciality", a.getDoctor().getSpeciality());
                    doctorMap.put("image", a.getDoctor().getImage());
                    doctorMap.put("fees", a.getDoctor().getFees());
                }

                Map<String, Object> patientMap = new HashMap<>();
                if (a.getPatient() != null) {
                    patientMap.put("id", a.getPatient().getId());
                    patientMap.put("fullName", a.getPatient().getFullName());
                    patientMap.put("email", a.getPatient().getEmail());
                }

                Map<String, Object> item = new HashMap<>();
                item.put("id", a.getId());
                item.put("date", a.getDate());
                item.put("time", a.getTime());
                item.put("status", a.getStatus());
                item.put("doctor", doctorMap);
                item.put("patient", patientMap);
                return item;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Cancel an appointment by ID
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        try {
            // Get existing appointment to capture patient/email before deletion
            Appointment appt = appointmentService.getAppointmentById(id);
            appointmentService.cancelAppointment(id);

            // Emit cancellation event with minimal patient info
            try {
                java.util.Map<String, Object> evt = new java.util.HashMap<>();
                evt.put("type", "appointment_cancelled");
                evt.put("id", id);
                if (appt != null && appt.getPatient() != null) {
                    evt.put("patientEmail", appt.getPatient().getEmail());
                }
                if (appt != null) {
                    evt.put("date", appt.getDate());
                    evt.put("time", appt.getTime());
                }
                eventStreamService.emit(evt);
            } catch (Exception ignored) {}
            return ResponseEntity.ok(new ApiResponse(true, "Appointment cancelled"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Update appointment status by assigned doctor (or admin)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Not authenticated"));
            }

            Appointment appt = appointmentService.getAppointmentById(id);
            if (appt == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(false, "Appointment not found"));
            }

            // Allow only the assigned doctor or an admin to update
            String requesterEmail = principal.getName();
            boolean isAdmin = false;
            try {
                org.springframework.security.core.Authentication auth =
                        org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getAuthorities() != null) {
                    isAdmin = auth.getAuthorities().stream()
                            .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                            .anyMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a) || "ADMIN".equalsIgnoreCase(a));
                }
            } catch (Exception ignored) {}

            String assignedDoctorEmail = appt.getDoctor() != null ? appt.getDoctor().getEmail() : null;
            if (!isAdmin && (assignedDoctorEmail == null || !assignedDoctorEmail.equalsIgnoreCase(requesterEmail))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "Not authorized to update this appointment"));
            }

            Appointment updated = appointmentService.updateStatus(id, status);

            // Emit status update event
            try {
                java.util.Map<String, Object> evt = new java.util.HashMap<>();
                evt.put("type", "appointment_status");
                evt.put("id", updated.getId());
                evt.put("status", updated.getStatus());
                evt.put("updatedBy", requesterEmail);
                if (updated.getPatient() != null) {
                    evt.put("patientEmail", updated.getPatient().getEmail());
                }
                evt.put("date", updated.getDate());
                evt.put("time", updated.getTime());
                eventStreamService.emit(evt);
            } catch (Exception ignored) {}

            // Return a minimal payload to avoid lazy-loading serialization issues
            java.util.Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("id", updated.getId());
            resp.put("status", updated.getStatus());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Helper DTOs as static inner classes to ensure single top-level class
    public static class AppointmentRequest {
        private Long doctorId;
        private String date;
        private String time;

        public Long getDoctorId() {
            return doctorId;
        }

        public void setDoctorId(Long doctorId) {
            this.doctorId = doctorId;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }
    }

    public static class ApiResponse {
        private boolean success;
        private String message;

        public ApiResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}