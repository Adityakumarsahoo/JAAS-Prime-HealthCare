package com.excelR.JAASPrimeHealthCare.dto;

import lombok.Data;

@Data
public class AppointmentDTO {

    private Long patientId;
    private Long doctorId;

    private String date;
    private String time;

}
