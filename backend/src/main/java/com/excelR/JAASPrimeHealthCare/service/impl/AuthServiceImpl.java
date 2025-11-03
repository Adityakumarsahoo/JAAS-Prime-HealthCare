package com.excelR.JAASPrimeHealthCare.service.impl;

import com.excelR.JAASPrimeHealthCare.dto.RegisterRequest;
import com.excelR.JAASPrimeHealthCare.entity.Role;
import com.excelR.JAASPrimeHealthCare.entity.Patient;
import com.excelR.JAASPrimeHealthCare.entity.PatientStatus;
import com.excelR.JAASPrimeHealthCare.entity.Doctor;
import com.excelR.JAASPrimeHealthCare.repository.PatientRepository;
import com.excelR.JAASPrimeHealthCare.repository.DoctorRepository;
import com.excelR.JAASPrimeHealthCare.service.AuthService;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPasswordHash;

    public AuthServiceImpl(
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Object register(RegisterRequest req) {

        if (req.getRole().equalsIgnoreCase("PATIENT")) {

            if (patientRepository.findByEmail(req.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already in use");
            }

            Patient patient = Patient.builder()
                    .fullName(req.getFullName())
                    .email(req.getEmail())
                    .password(passwordEncoder.encode(req.getPassword()))
                    .role(Role.PATIENT)
                    .status(PatientStatus.PENDING)
                    .build();

            return patientRepository.save(patient);
        }
        else if (req.getRole().equalsIgnoreCase("DOCTOR")) {

            if (doctorRepository.findByEmail(req.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already in use");
            }

            Doctor doctor = Doctor.builder()
                    .fullName(req.getFullName())
                    .email(req.getEmail())
                    .speciality(req.getSpeciality())
                    .password(passwordEncoder.encode(req.getPassword()))
                    .available(true)
                    .role(Role.DOCTOR)
                    .build();

            return doctorRepository.save(doctor);
        }

        throw new IllegalArgumentException("Invalid role");
    }

    @Override
    public Object login(String email, String password) {

        // Check Patient
        Patient patient = patientRepository.findByEmail(email).orElse(null);
        if (patient != null && passwordEncoder.matches(password, patient.getPassword())) {
            return patient;
        }

        // Check Doctor
        Doctor doctor = doctorRepository.findByEmail(email).orElse(null);
        if (doctor != null && passwordEncoder.matches(password, doctor.getPassword())) {
            return doctor;
        }

        // Check Admin (from properties, using BCrypt hash)
        try {
            if (adminEmail != null && adminPasswordHash != null
                    && email.equalsIgnoreCase(adminEmail)
                    && passwordEncoder.matches(password, adminPasswordHash)) {
                Map<String, Object> admin = new HashMap<>();
                admin.put("id", 0);
                admin.put("fullName", "Admin");
                admin.put("email", email);
                admin.put("role", "ADMIN");
                return admin;
            }
        } catch (Exception ignored) {}

        throw new IllegalArgumentException("Invalid credentials");
    }

}
