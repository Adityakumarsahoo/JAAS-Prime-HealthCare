package com.excelR.JAASPrimeHealthCare.dto;
import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
@Data
public class RegisterRequest {
	@NotBlank
    private String fullName;

    @Email
    private String email;

    @NotBlank
    private String password;
    
    @NotBlank
    private String role;       // "PATIENT" or "DOCTOR"
    private String speciality; // only for doctor

}
