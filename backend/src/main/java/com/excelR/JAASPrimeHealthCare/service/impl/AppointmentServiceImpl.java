package com.excelR.JAASPrimeHealthCare.service.impl;

import com.excelR.JAASPrimeHealthCare.dao.AppointmentDao;

import com.excelR.JAASPrimeHealthCare.dao.PatientDao;
import com.excelR.JAASPrimeHealthCare.dao.DoctorDao;
import com.excelR.JAASPrimeHealthCare.dto.AppointmentDTO;
import com.excelR.JAASPrimeHealthCare.entity.Appointment;
import com.excelR.JAASPrimeHealthCare.entity.Patient;
import com.excelR.JAASPrimeHealthCare.entity.Doctor;
import com.excelR.JAASPrimeHealthCare.exception.ResourceNotFoundException;
import com.excelR.JAASPrimeHealthCare.service.AppointmentService;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentDao appointmentDao;
    private final PatientDao patientDao;
    private final DoctorDao doctorDao;

    public AppointmentServiceImpl(AppointmentDao appointmentDao, PatientDao patientDao, DoctorDao doctorDao) {
        this.appointmentDao = appointmentDao;
        this.patientDao = patientDao;
        this.doctorDao = doctorDao;
    }

    @Override
    public Appointment book(AppointmentDTO dto) {

        Patient patient = patientDao.getPatientById(dto.getPatientId());
        if (patient == null) throw new ResourceNotFoundException("User not found");

        Doctor doctor = doctorDao.getDoctorById(dto.getDoctorId());
        if (doctor == null) throw new ResourceNotFoundException("Doctor not found");
        if (!doctor.isAvailable()) throw new RuntimeException("Doctor not available for appointments");

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setDate(dto.getDate());
        appointment.setTime(dto.getTime());
        appointment.setStatus("PENDING");

        return appointmentDao.saveAppointment(appointment);
    }

    @Override
    public Appointment bookAppointment(Long doctorId, String patientEmail, String date, String time) {

        Patient patient = patientDao.fetchPatientByEmail(patientEmail)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorDao.getDoctorById(doctorId);
        if (doctor == null) throw new RuntimeException("Doctor not found");
        if (!doctor.isAvailable()) throw new RuntimeException("Doctor not available for appointments");

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setDate(date);
        appointment.setTime(time);
        appointment.setStatus("PENDING");

        return appointmentDao.saveAppointment(appointment);
    }

    @Override
    public Appointment getAppointmentById(Long id) {
        return appointmentDao.getAppointmentById(id);
    }

    @Override
    public List<Appointment> getAppointmentsByPatient(Long userId) {
        return appointmentDao.fetchAppointmentsByPatientId(userId);
    }

    @Override
    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentDao.fetchAppointmentsByDoctorId(doctorId);
    }

    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentDao.fetchAllAppointments();
    }

    @Override
    public Appointment updateStatus(Long id, String status) {
        Appointment appt = appointmentDao.getAppointmentById(id);
        if (appt == null) throw new ResourceNotFoundException("Appointment not found");

        appt.setStatus(status);
        return appointmentDao.saveAppointment(appt);
    }

    @Override
    public void cancelAppointment(Long id) {
        Appointment deleted = appointmentDao.deleteAppointment(id);
        if (deleted == null) throw new ResourceNotFoundException("Appointment not found");
    }
}
