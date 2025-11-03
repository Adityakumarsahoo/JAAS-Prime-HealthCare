package com.excelR.JAASPrimeHealthCare.service;

import com.excelR.JAASPrimeHealthCare.dto.AppointmentDTO;

import com.excelR.JAASPrimeHealthCare.entity.Appointment;

import java.util.List;


public interface AppointmentService {

    Appointment book(AppointmentDTO appointmentDTO);

    Appointment bookAppointment(Long doctorId, String patientEmail, String date, String time);
    
    Appointment getAppointmentById(Long id);

    List<Appointment> getAppointmentsByPatient(Long userId);

    List<Appointment> getAppointmentsByDoctor(Long doctorId);

    List<Appointment> getAllAppointments();

    Appointment updateStatus(Long id, String status);

    void cancelAppointment(Long id);
}
