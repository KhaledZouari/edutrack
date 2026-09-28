package com.edutrack.edutrack.repository;

import com.edutrack.edutrack.entity.PasswordResetToken;
import com.edutrack.edutrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUser(User user);
}
