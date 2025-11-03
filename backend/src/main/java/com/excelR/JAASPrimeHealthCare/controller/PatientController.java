package com.excelR.JAASPrimeHealthCare.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.excelR.JAASPrimeHealthCare.entity.Patient;
import com.excelR.JAASPrimeHealthCare.entity.PatientStatus;
import com.excelR.JAASPrimeHealthCare.repository.PatientRepository;
import com.excelR.JAASPrimeHealthCare.service.PatientService;
import com.excelR.JAASPrimeHealthCare.service.JwtService;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private com.excelR.JAASPrimeHealthCare.service.EventStreamService eventStreamService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");

        if (patientRepository.findByEmail(email).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email already registered"));
        }

        Patient patient = new Patient();
        patient.setFullName(name);
        patient.setEmail(email);
        patient.setPassword(passwordEncoder.encode(password));
        patient.setRole(com.excelR.JAASPrimeHealthCare.entity.Role.PATIENT);
        patient.setStatus(PatientStatus.PENDING);

        Patient saved = patientRepository.save(patient);

        // Emit SSE event so Admin dashboard reflects new patient in real-time
        try {
            Map<String, Object> evt = new HashMap<>();
            evt.put("type", "patient_registered");
            evt.put("id", saved.getId());
            evt.put("email", saved.getEmail());
            evt.put("fullName", saved.getFullName());
            eventStreamService.emit(evt);
        } catch (Exception ignored) {}

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Patient registered successfully",
                        "id", saved.getId(),
                        "email", saved.getEmail(),
                        "fullName", saved.getFullName()
                ));
    }

    // Update patient profile (self-service)
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePatient(@PathVariable Long id, @RequestBody Patient updated, java.security.Principal principal) {
        try {
            if (principal == null || principal.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }

            // Ensure the caller is updating their own profile
            var existingOpt = patientService.getById(id);
            if (existingOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Patient not found"));
            }

            var existing = existingOpt.get();
            if (!principal.getName().equals(existing.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only update your own profile"));
            }

            var saved = patientService.update(id, updated);

            // Emit patient update event (minimal payload)
            try {
                java.util.Map<String, Object> evt = new java.util.HashMap<>();
                evt.put("type", "patient_update");
                evt.put("id", saved.getId());
                evt.put("email", saved.getEmail());
                eventStreamService.emit(evt);
            } catch (Exception ignored) {}

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating patient: " + e.getMessage()));
        }
    }

    @CrossOrigin
    @org.springframework.web.bind.annotation.GetMapping("/profile")
    public ResponseEntity<?> getProfile(java.security.Principal principal) {
        try {
            if (principal == null || principal.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }

            String email = principal.getName();

            return patientRepository.findByEmail(email)
                    .map(patient -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("id", patient.getId());
                        response.put("fullName", patient.getFullName());
                        response.put("email", patient.getEmail());
                        response.put("role", patient.getRole());
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("message", "Patient not found")));
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving patient profile: " + e.getMessage()));
        }
    }
}
