package com.excelR.JAASPrimeHealthCare.service.impl;

import com.excelR.JAASPrimeHealthCare.dto.PatientDTO;

import com.excelR.JAASPrimeHealthCare.entity.Patient;
import com.excelR.JAASPrimeHealthCare.entity.PatientStatus;
import com.excelR.JAASPrimeHealthCare.exception.ResourceNotFoundException;
import com.excelR.JAASPrimeHealthCare.dao.PatientDao;
import com.excelR.JAASPrimeHealthCare.service.PatientService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientDao patientDao;
    private final BCryptPasswordEncoder passwordEncoder;

    public PatientServiceImpl(PatientDao patientDao, BCryptPasswordEncoder passwordEncoder) {
        this.patientDao = patientDao;
        this.passwordEncoder = passwordEncoder;
    }

//    
//    public User register(User user) {
//        user.setPassword(passwordEncoder.encode(user.getPassword()));
//        return userDao.saveUser(user);
//    }

    
    public Patient create(Patient patient) {
        return patientDao.savePatient(patient);
    }

    
    public PatientDTO toDTO(Patient patient) {
        return new PatientDTO(
                patient.getId(),
                patient.getFullName(),
                patient.getEmail(),
                patient.getRole().name(),
                patient.getStatus() != null ? patient.getStatus().name() : null
        );
    }

    @Override
    public Optional<Patient> findByEmail(String email) {
        return patientDao.fetchPatientByEmail(email);
    }

    @Override
    public Optional<Patient> getById(Long id) {
        Patient patient = patientDao.getPatientById(id);
        return Optional.ofNullable(patient);
    }

    @Override
    public List<PatientDTO> listAll() {
        return patientDao.fetchAllPatients()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PatientDTO> listByStatus(PatientStatus status) {
        return patientDao.fetchPatientsByStatus(status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Patient approve(Long id) {
        Patient existing = patientDao.getPatientById(id);
        if (existing == null) {
            throw new ResourceNotFoundException("User not found with id " + id);
        }
        existing.setStatus(PatientStatus.APPROVED);
        // Use update to avoid re-encoding password
        Patient saved = patientDao.updatePatient(existing);
        return saved;
    }

    @Override
    public Patient update(Long id, Patient updatedPatient) {
        Patient existing = patientDao.getPatientById(id);
        if (existing == null) {
            throw new ResourceNotFoundException("User not found with id " + id);
        }

        existing.setFullName(updatedPatient.getFullName());
        existing.setEmail(updatedPatient.getEmail());

        if (updatedPatient.getPassword() != null && !updatedPatient.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updatedPatient.getPassword()));
        }

        return patientDao.savePatient(existing);
    }

    @Override
    public void delete(Long id) {
        Patient deleted = patientDao.deletePatient(id);
        if (deleted == null) {
            throw new ResourceNotFoundException("User not found with id " + id);
        }
    }
}
