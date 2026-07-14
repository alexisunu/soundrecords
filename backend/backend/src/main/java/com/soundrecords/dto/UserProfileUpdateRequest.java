package com.soundrecords.dto;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {

    private String username;
    private String bio;
    private String photoUrl;
}
