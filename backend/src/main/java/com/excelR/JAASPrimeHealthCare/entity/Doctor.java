package com.excelR.JAASPrimeHealthCare.entity;
import lombok.*;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

	@Column(nullable = false)
    private String fullName;
	
    private String speciality;

    @Column(nullable = false, unique = true)
    private String email;  // username for login
    
    private String about;
    
    private String image; // photo URL
    
    @Column(nullable = false)
    private String password;
    
    private boolean featured;// top doctors

    // Availability flag for booking visibility
    private boolean available;
    
    // Doctor's consultation fee
    private Double fees;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;  // DOCTOR or ADMIN
}
