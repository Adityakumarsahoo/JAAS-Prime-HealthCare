package com.excelR.JAASPrimeHealthCare.controller;

import com.excelR.JAASPrimeHealthCare.service.EventStreamService;
import com.excelR.JAASPrimeHealthCare.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
public class PatientEventsController {

    private final EventStreamService eventStreamService;
    private final JwtService jwtService;

    public PatientEventsController(EventStreamService eventStreamService, JwtService jwtService) {
        this.eventStreamService = eventStreamService;
        this.jwtService = jwtService;
    }

    // SSE stream for patient dashboard; token passed via query param due to EventSource limitations
    @GetMapping("/api/patient/events")
    public ResponseEntity<?> subscribe(@RequestParam(name = "token", required = false) String token) {
        try {
            boolean authorized = false;
            if (token != null && jwtService.validateToken(token)) {
                String role = jwtService.extractRole(token);
                authorized = role != null && "PATIENT".equalsIgnoreCase(role);
            }

            if (!authorized) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("message", "Unauthorized"));
            }

            SseEmitter emitter = eventStreamService.subscribe();
            return ResponseEntity.ok(emitter);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", e.getMessage()));
        }
    }
}