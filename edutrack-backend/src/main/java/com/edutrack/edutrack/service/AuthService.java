package com.edutrack.edutrack.service;

import com.edutrack.edutrack.dto.request.LoginRequest;
import com.edutrack.edutrack.dto.request.LogoutRequest;
import com.edutrack.edutrack.dto.request.RefreshTokenRequest;
import com.edutrack.edutrack.dto.request.RegisterRequest;
import com.edutrack.edutrack.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void logout(LogoutRequest request);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);

    AuthResponse loginWithFirebase(String idToken, String role);
}