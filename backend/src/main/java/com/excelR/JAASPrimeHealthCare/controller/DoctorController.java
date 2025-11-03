package com.excelR.JAASPrimeHealthCare.controller;

import com.excelR.JAASPrimeHealthCare.entity.Doctor;
import com.excelR.JAASPrimeHealthCare.exception.ResourceNotFoundException;
import com.excelR.JAASPrimeHealthCare.service.DoctorService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // Get all doctors
    // http://localhost:8080/api/doctors
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    // Get featured doctors
    // http://localhost:8080/api/doctors/featured
    @GetMapping("/featured")
    public ResponseEntity<List<Doctor>> getFeaturedDoctors() {
        return ResponseEntity.ok(doctorService.getFeaturedDoctors());
    }

    // Get doctor by ID
    // http://localhost:8080/api/doctors/1
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctor(@PathVariable Long id) {
        Doctor d = doctorService.getDoctorById(id);
        return ResponseEntity.ok(d);
    }

    // Create doctor
    // http://localhost:8080/api/doctors
    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        Doctor saved = doctorService.saveDoctor(doctor);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Update doctor
    @PutMapping("/{id}")
    // http://localhost:8080/api/doctors/1
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, doctor));
    }

    // Delete doctor
    // http://localhost:8080/api/doctors/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // Get profile of logged-in doctor
    // http://localhost:8080/api/doctors/profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(java.security.Principal principal) {
        try {
            if (principal == null || principal.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("message", "Not authenticated"));
            }

            String email = principal.getName();
            var doctorOpt = doctorService.findByEmail(email);
            if (doctorOpt.isPresent()) {
                var doctor = doctorOpt.get();
                java.util.Map<String, Object> resp = new java.util.HashMap<>();
                resp.put("id", doctor.getId());
                resp.put("fullName", doctor.getFullName());
                resp.put("email", doctor.getEmail());
                resp.put("speciality", doctor.getSpeciality());
                resp.put("about", doctor.getAbout());
                resp.put("image", doctor.getImage());
                resp.put("available", doctor.isAvailable());
                resp.put("role", doctor.getRole());
                return ResponseEntity.ok(resp);
            }

            // If authenticated as DOCTOR but profile record doesn't exist, return a safe fallback
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isDoctorAuthority = authentication != null && authentication.getAuthorities() != null &&
                    authentication.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .anyMatch(a -> "DOCTOR".equalsIgnoreCase(a) || "ROLE_DOCTOR".equalsIgnoreCase(a));

            if (isDoctorAuthority) {
                java.util.Map<String, Object> resp = new java.util.HashMap<>();
                resp.put("id", null);
                resp.put("fullName", "");
                resp.put("email", email);
                resp.put("speciality", "");
                resp.put("about", "");
                resp.put("image", "");
                resp.put("available", true);
                resp.put("role", "DOCTOR");
                resp.put("message", "Profile not yet set up");
                return ResponseEntity.ok(resp);
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("message", "Doctor not found"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Error retrieving profile: " + e.getMessage()));
        }
    }

}
