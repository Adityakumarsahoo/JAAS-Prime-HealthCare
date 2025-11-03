package com.excelR.JAASPrimeHealthCare.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.excelR.JAASPrimeHealthCare.entity.Doctor;
import com.excelR.JAASPrimeHealthCare.repository.DoctorRepository;

@Repository
public class DoctorDao {

    @Autowired
    private DoctorRepository repository;

    @Autowired
    private PasswordEncoder encoder;

    public Doctor saveDoctor(Doctor d) {
        d.setPassword(encoder.encode(d.getPassword()));
        return repository.save(d);
    }

    public Doctor deleteDoctor(Long id) {
        Optional<Doctor> db = repository.findById(id);
        if (db.isPresent()) {
            repository.deleteById(id);
            return db.get();
        } else {
            return null;
        }
    }

    public Doctor updateDoctor(Doctor doctor) {
        Optional<Doctor> db = repository.findById(doctor.getId());
        if (db.isPresent()) {
            // Preserve existing encoded password unless a new one is provided
            if (doctor.getPassword() == null || doctor.getPassword().isBlank()) {
                doctor.setPassword(db.get().getPassword());
            } else {
                doctor.setPassword(encoder.encode(doctor.getPassword()));
            }
            return repository.save(doctor);
        } else {
            return null;
        }
    }

    public Doctor getDoctorById(Long id) {
        Optional<Doctor> db = repository.findById(id);
        return db.orElse(null);
    }

    public List<Doctor> fetchAllDoctors() {
        return repository.findAll();
    }

    public List<Doctor> fetchFeaturedDoctors() {
        return repository.findByFeaturedTrue();
    }

    public Optional<Doctor> findByEmail(String email) {
        return repository.findByEmail(email);
    }

	public Doctor getDoctorByEmail(String email) {
		return repository.findByEmail(email).orElse(null);
	}
}
