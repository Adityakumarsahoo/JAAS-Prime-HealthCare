package com.excelR.JAASPrimeHealthCare.dao;

import java.util.List;

import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.excelR.JAASPrimeHealthCare.entity.Patient;
import com.excelR.JAASPrimeHealthCare.entity.PatientStatus;
import com.excelR.JAASPrimeHealthCare.repository.PatientRepository;

@Repository
public class PatientDao {

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private PatientRepository repository;

    public Patient savePatient(Patient patient) {
        patient.setPassword(encoder.encode(patient.getPassword()));
        return repository.save(patient);
    }

    public Patient deletePatient(Long id) {
        Optional<Patient> db = repository.findById(id);
        if (db.isPresent()) {
            repository.deleteById(id);
            return db.get();
        } else {
            return null;
        }
    }

    public Patient updatePatient(Patient patient) {
        Optional<Patient> db = repository.findById(patient.getId());
        if (db.isPresent()) {
            return repository.save(patient);
        } else {
            return null;
        }
    }

    public Patient getPatientById(Long id) {
        Optional<Patient> db = repository.findById(id);
        return db.orElse(null);
    }

    public List<Patient> fetchAllPatients() {
        return repository.findAll();
    }

    public Optional<Patient> fetchPatientByEmail(String email) {
        return repository.findByEmail(email);
    }

    public List<Patient> fetchPatientsByStatus(PatientStatus status) {
        return repository.findByStatus(status);
    }
}
