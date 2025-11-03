package com.excelR.JAASPrimeHealthCare.repository;

import com.excelR.JAASPrimeHealthCare.entity.Patient;
import com.excelR.JAASPrimeHealthCare.entity.PatientStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);
    List<Patient> findByStatus(PatientStatus status);
}