package com.soundrecords.dto;

import lombok.Data;

@Data
public class UserCredentialsUpdateRequest {

    private String email;
    private String newPassword;
}
