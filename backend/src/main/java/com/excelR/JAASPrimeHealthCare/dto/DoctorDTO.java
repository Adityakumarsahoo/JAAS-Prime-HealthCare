package com.excelR.JAASPrimeHealthCare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DoctorDTO {

    private Long id;
    private String fullName;
    private String speciality;
    private String email;
    private String about;
    private String experience;
    private String degree;
    private boolean isFeatured;
    private String role;   // DOCTOR / ADMIN
}
