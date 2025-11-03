package com.excelR.JAASPrimeHealthCare.service;

import com.excelR.JAASPrimeHealthCare.dto.PatientDTO;
import com.excelR.JAASPrimeHealthCare.entity.Patient;
import com.excelR.JAASPrimeHealthCare.entity.PatientStatus;

import java.util.List;
import java.util.Optional;

public interface PatientService {

    //  Create patient (internal for Admin or AuthController)
    Patient create(Patient user);

    //  Convert to DTO (hide password)
    PatientDTO toDTO(Patient user);

    //  Find patient by email (for login)
    Optional<Patient> findByEmail(String email);

    //  Get patient by ID
    Optional<Patient> getById(Long id);

    //  Get all patients (admin)
    List<PatientDTO> listAll();

    //  Get patients by status
    List<PatientDTO> listByStatus(PatientStatus status);

    //  Update patient
    Patient update(Long id, Patient patient);

    //  Approve patient
    Patient approve(Long id);

    //  Delete patient
    void delete(Long id);
}
