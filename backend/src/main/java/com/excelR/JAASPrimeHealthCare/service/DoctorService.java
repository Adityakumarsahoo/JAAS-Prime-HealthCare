package com.excelR.JAASPrimeHealthCare.service;

import com.excelR.JAASPrimeHealthCare.entity.Doctor;

import java.util.List;
import java.util.Optional;

public interface DoctorService {

    Doctor saveDoctor(Doctor doctor);

    Doctor updateDoctor(Long id, Doctor doctor);

    Doctor getDoctorById(Long id);

    List<Doctor> getAllDoctors();

    List<Doctor> getFeaturedDoctors();

    void deleteDoctor(Long id);

    Optional<Doctor> findByEmail(String email);
}
