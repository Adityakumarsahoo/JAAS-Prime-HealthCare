package com.excelR.JAASPrimeHealthCare.controller;

import com.excelR.JAASPrimeHealthCare.entity.Doctor;
import com.excelR.JAASPrimeHealthCare.entity.Appointment;
import com.excelR.JAASPrimeHealthCare.entity.PatientStatus;
import com.excelR.JAASPrimeHealthCare.service.DoctorService;
import com.excelR.JAASPrimeHealthCare.service.PatientService;
import com.excelR.JAASPrimeHealthCare.service.AppointmentService;
import com.excelR.JAASPrimeHealthCare.service.EventStreamService;
import com.excelR.JAASPrimeHealthCare.dto.PatientDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final DoctorService doctorService;
    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final EventStreamService eventStreamService;

    public AdminController(DoctorService doctorService, PatientService patientService, AppointmentService appointmentService, EventStreamService eventStreamService) {
        this.doctorService = doctorService;
        this.patientService = patientService;
        this.appointmentService = appointmentService;
        this.eventStreamService = eventStreamService;
    }

    // GET all users
    @GetMapping("/users")
    public ResponseEntity<List<?>> getAllUsers() {
        return ResponseEntity.ok(patientService.listAll());
    }

    // DELETE a user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        patientService.delete(id);
        return ResponseEntity.ok("Patient deleted successfully");
    }

    //  GET all appointments
    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    //  Update appointment status
    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        Appointment updated = appointmentService.updateStatus(id, status);

        // Emit status update event for admin actions as well
        try {
            java.util.Map<String, Object> evt = new java.util.HashMap<>();
            evt.put("type", "appointment_status");
            evt.put("id", updated.getId());
            evt.put("status", updated.getStatus());
            evt.put("updatedBy", "ADMIN");
            if (updated.getPatient() != null) {
                evt.put("patientEmail", updated.getPatient().getEmail());
            }
            evt.put("date", updated.getDate());
            evt.put("time", updated.getTime());
            eventStreamService.emit(evt);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(updated);
    }

    //  ADD doctor
    @PostMapping("/doctors")
    public ResponseEntity<?> addDoctor(@RequestBody Doctor doctor) {
        try {
            if (doctor.getEmail() == null || doctor.getEmail().isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("message", "Email is required"));
            }

            if (doctorService.findByEmail(doctor.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("message", "Email already registered"));
            }

            Doctor saved = doctorService.saveDoctor(doctor);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Failed to add doctor"));
        }
    }

    //  UPDATE doctor
    @PutMapping("/doctors/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, doctor));
    }

    //  DELETE doctor
    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok("Doctor deleted successfully");
    }

    //  GET all doctors
    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    //  GET all pending patients
    @GetMapping("/patients/pending")
    public ResponseEntity<List<PatientDTO>> getPendingPatients() {
        return ResponseEntity.ok(patientService.listByStatus(PatientStatus.PENDING));
    }

    //  Approve a patient
    @PutMapping("/patients/{id}/approve")
    public ResponseEntity<?> approvePatient(@PathVariable Long id) {
        var approved = patientService.approve(id);

        // Emit event for admin actions
        try {
            java.util.Map<String, Object> evt = new java.util.HashMap<>();
            evt.put("type", "patient_approved");
            evt.put("id", approved.getId());
            evt.put("email", approved.getEmail());
            evt.put("fullName", approved.getFullName());
            evt.put("status", approved.getStatus() != null ? approved.getStatus().name() : null);
            eventStreamService.emit(evt);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(java.util.Map.of(
                "message", "Patient approved",
                "id", approved.getId()
        ));
    }
}
