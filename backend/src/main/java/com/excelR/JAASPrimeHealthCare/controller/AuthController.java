package com.excelR.JAASPrimeHealthCare.controller;

import com.excelR.JAASPrimeHealthCare.dto.LoginRequest;
import com.excelR.JAASPrimeHealthCare.dto.RegisterRequest;
import com.excelR.JAASPrimeHealthCare.entity.Doctor;
import com.excelR.JAASPrimeHealthCare.entity.Patient;
import com.excelR.JAASPrimeHealthCare.service.AuthService;
import com.excelR.JAASPrimeHealthCare.service.EventStreamService;
import com.excelR.JAASPrimeHealthCare.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final EventStreamService eventStreamService;

    public AuthController(AuthService authService, JwtService jwtService, EventStreamService eventStreamService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.eventStreamService = eventStreamService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        Object created = authService.register(req);

        Map<String, Object> resp = new HashMap<>();
        if (created instanceof Patient) {
            Patient p = (Patient) created;
            resp.put("id", p.getId());
            resp.put("fullName", p.getFullName());
            resp.put("email", p.getEmail());
            resp.put("role", p.getRole().name());
            resp.put("message", "Patient registered successfully");

            // Emit SSE event for admin dashboard
            try {
                java.util.Map<String, Object> evt = new java.util.HashMap<>();
                evt.put("type", "patient_registered");
                evt.put("id", p.getId());
                evt.put("fullName", p.getFullName());
                evt.put("email", p.getEmail());
                eventStreamService.emit(evt);
            } catch (Exception ignored) {}
        } else if (created instanceof Doctor) {
            Doctor d = (Doctor) created;
            resp.put("id", d.getId());
            resp.put("fullName", d.getFullName());
            resp.put("email", d.getEmail());
            resp.put("role", d.getRole().name());
            resp.put("message", "Doctor registered successfully");
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown registration result"));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            Object user = authService.login(req.getEmail(), req.getPassword());

            Map<String, Object> response = new HashMap<>();
            String role = null;
            Long id = null;
            String fullName = null;
            String email = req.getEmail();

            // populate response map and extract role into roleStr
            if (user instanceof Patient) {
                Patient p = (Patient) user;
                id = p.getId();
                fullName = p.getFullName();
                role = p.getRole() != null ? p.getRole().name() : null;

                response.put("id", id);
                response.put("fullName", fullName);
                response.put("email", p.getEmail());
                response.put("role", role);
            } else if (user instanceof Doctor) {
                Doctor d = (Doctor) user;
                id = d.getId();
                fullName = d.getFullName();
                role = d.getRole() != null ? d.getRole().name() : null;

                response.put("id", id);
                response.put("fullName", fullName);
                response.put("email", d.getEmail());
                response.put("role", role);
            } else if (user instanceof Map) {
                // admin case where AuthService returns a Map (id/fullName/email/role)
                @SuppressWarnings("unchecked")
                Map<String, Object> adminMap = (Map<String, Object>) user;
                Object roleObj = adminMap.get("role");
                role = roleObj != null ? roleObj.toString() : null;
                response.putAll(adminMap);
            }

            // validate role before generating token
            if (role == null || role.isBlank()) {
                // defensive: if role missing, return error instead of calling generateToken
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "User role missing - cannot generate token"));
            }

            // generate token with email and role (JwtService must have generateToken(email, role))
            String token = jwtService.generateToken(email, role);

            response.put("token", token);
            response.put("message", "Login successful");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // unexpected errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
