package com.excelR.JAASPrimeHealthCare.service;
import com.excelR.JAASPrimeHealthCare.dto.RegisterRequest;

public interface AuthService {
	Object register(RegisterRequest req);
    Object login(String email, String password);
}
