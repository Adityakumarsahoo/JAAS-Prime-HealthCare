package com.excelR.JAASPrimeHealthCare.service.impl;

import com.excelR.JAASPrimeHealthCare.dao.DoctorDao;
import com.excelR.JAASPrimeHealthCare.entity.Doctor;
import com.excelR.JAASPrimeHealthCare.entity.Role;
import com.excelR.JAASPrimeHealthCare.exception.ResourceNotFoundException;
import com.excelR.JAASPrimeHealthCare.service.DoctorService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorServiceImpl implements DoctorService {

    private final DoctorDao doctorDao;

    public DoctorServiceImpl(DoctorDao doctorDao) {
        this.doctorDao = doctorDao;
    }

    @Override
    public Doctor saveDoctor(Doctor d) {
        if (d.getEmail() != null && doctorDao.findByEmail(d.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        d.setRole(Role.DOCTOR);
        return doctorDao.saveDoctor(d);
    }

    @Override
    public Doctor updateDoctor(Long id, Doctor newDoctor) {
        Doctor existing = doctorDao.getDoctorById(id);
        if (existing == null) {
            throw new ResourceNotFoundException("Doctor not found with id " + id);
        }

        existing.setFullName(newDoctor.getFullName());
        existing.setSpeciality(newDoctor.getSpeciality());
        existing.setEmail(newDoctor.getEmail());
        existing.setAbout(newDoctor.getAbout());
        existing.setImage(newDoctor.getImage());
        existing.setFeatured(newDoctor.isFeatured());
        existing.setAvailable(newDoctor.isAvailable());
        existing.setFees(newDoctor.getFees());

        // Set raw password if provided (will be encoded by DAO)
        if (newDoctor.getPassword() != null && !newDoctor.getPassword().isBlank()) {
            existing.setPassword(newDoctor.getPassword());
        }

        return doctorDao.updateDoctor(existing);
    }

    @Override
    public Doctor getDoctorById(Long id) {
        Doctor doctor = doctorDao.getDoctorById(id);
        if (doctor == null) {
            throw new ResourceNotFoundException("Doctor not found with id " + id);
        }
        return doctor;
    }

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorDao.fetchAllDoctors();
    }

    @Override
    public List<Doctor> getFeaturedDoctors() {
        return doctorDao.fetchFeaturedDoctors();
    }

    @Override
    public void deleteDoctor(Long id) {
        Doctor deleted = doctorDao.deleteDoctor(id);
        if (deleted == null) {
            throw new ResourceNotFoundException("Doctor not found with id " + id);
        }
    }

    @Override
    public Optional<Doctor> findByEmail(String email) {
        return doctorDao.findByEmail(email);
    }
}
