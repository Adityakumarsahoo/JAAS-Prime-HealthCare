package com.excelR.JAASPrimeHealthCare.entity;
import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private String date;   // yyyy-MM-dd

    @Column(nullable = false)
    private String time;   // HH:mm

    @Column(nullable = false)
    private String status; // PENDING, CONFIRMED, CANCELLED
}
