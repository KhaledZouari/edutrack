package com.edutrack.edutrack.service.impl;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.edutrack.edutrack.dto.request.LoginRequest;
import com.edutrack.edutrack.dto.request.LogoutRequest;
import com.edutrack.edutrack.dto.request.RefreshTokenRequest;
import com.edutrack.edutrack.dto.request.RegisterRequest;
import com.edutrack.edutrack.dto.response.AuthResponse;
import com.edutrack.edutrack.entity.PasswordResetToken;
import com.edutrack.edutrack.entity.RefreshToken;
import com.edutrack.edutrack.entity.User;
import com.edutrack.edutrack.enums.Role;
import com.edutrack.edutrack.exception.BusinessException;
import com.edutrack.edutrack.repository.PasswordResetTokenRepository;
import com.edutrack.edutrack.repository.RefreshTokenRepository;
import com.edutrack.edutrack.repository.UserRepository;
import com.edutrack.edutrack.security.JwtService;
import com.edutrack.edutrack.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Cet email est deja utilise.");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.STUDENT;
        if (role == Role.ADMIN) {
            throw new BusinessException("ADMIN role cannot be assigned during public registration");
        }

        User savedUser = userRepository.save(User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build());

        return buildAuthResponse(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("User not found"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new BusinessException("Account is disabled");
        }

        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BusinessException("Refresh token not found"));

        if (Boolean.TRUE.equals(storedToken.getRevoked())) {
            throw new BusinessException("Refresh token is revoked");
        }

        if (storedToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Refresh token is expired");
        }

        User user = storedToken.getUser();
        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(user))
                .refreshToken(storedToken.getToken())
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }

    @Override
    public void logout(LogoutRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BusinessException("Refresh token not found"));
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));

        passwordResetTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(2))
                .build());

        System.out.println("=================================================");
        System.out.println(" RESET PASSWORD TOKEN FOR " + email);
        System.out.println(" Token: " + token);
        System.out.println("=================================================");
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Invalid or expired token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BusinessException("Token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);
    }

    @Override
    public AuthResponse loginWithFirebase(String idToken, String requestedRole) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();
            String uid = decodedToken.getUid();

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                Role role = resolvePublicRole(requestedRole);
                user = userRepository.save(User.builder()
                        .email(email)
                        .firebaseUid(uid)
                        .firstName((String) decodedToken.getClaims().getOrDefault("name", ""))
                        .lastName("")
                        .role(role)
                        .active(true)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .createdAt(LocalDateTime.now())
                        .build());
            }

            if (user.getFirebaseUid() == null) {
                user.setFirebaseUid(uid);
                userRepository.save(user);
            }

            return buildAuthResponse(user);
        } catch (Exception e) {
            throw new BusinessException("Firebase authentication failed: " + e.getMessage());
        }
    }

    private Role resolvePublicRole(String requestedRole) {
        if (requestedRole == null || requestedRole.isBlank()) {
            return Role.STUDENT;
        }
        try {
            Role role = Role.valueOf(requestedRole.toUpperCase());
            return role == Role.ADMIN ? Role.STUDENT : role;
        } catch (IllegalArgumentException ignored) {
            return Role.STUDENT;
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(user))
                .refreshToken(createAndSaveRefreshToken(user))
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }

    private String createAndSaveRefreshToken(User user) {
        String tokenValue = "refresh-token-" + UUID.randomUUID();
        refreshTokenRepository.save(RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build());
        return tokenValue;
    }
}
