package com.excelR.JAASPrimeHealthCare.dao;

import java.util.List;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.excelR.JAASPrimeHealthCare.entity.Appointment;
import com.excelR.JAASPrimeHealthCare.repository.AppointmentRepository;

@Repository
public class AppointmentDao {

    @Autowired
    private AppointmentRepository repository;

    public Appointment saveAppointment(Appointment appointment) {
        return repository.save(appointment);
    }

    public Appointment getAppointmentById(Long id) {
        Optional<Appointment> db = repository.findById(id);
        return db.orElse(null);
    }

    public List<Appointment> fetchAppointmentsByPatientId(Long patientId) {
        return repository.findByPatient_Id(patientId);
    }

    public List<Appointment> fetchAppointmentsByDoctorId(Long doctorId) {
        return repository.findByDoctor_Id(doctorId);
    }

    public List<Appointment> fetchAllAppointments() {
        return repository.findAll();
    }

    public Appointment deleteAppointment(Long id) {
        Optional<Appointment> db = repository.findById(id);
        if (db.isPresent()) {
            repository.deleteById(id);
            return db.get();
        } else {
            return null;
        }
    }
}
