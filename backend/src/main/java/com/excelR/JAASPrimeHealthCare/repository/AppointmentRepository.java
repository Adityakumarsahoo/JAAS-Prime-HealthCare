package com.excelR.JAASPrimeHealthCare.repository;
import com.excelR.JAASPrimeHealthCare.entity.Appointment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
	List<Appointment> findByDoctor_Id(Long doctorId);
	List<Appointment> findByPatient_Id(Long patientId);
}
