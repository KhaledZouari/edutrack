package com.edutrack.edutrack.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.InputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp() {
        try {
            String firebaseConfigJson = System.getenv("FIREBASE_CONFIG_JSON");
            GoogleCredentials credentials;

            if (firebaseConfigJson != null && !firebaseConfigJson.isEmpty()) {
                credentials = GoogleCredentials.fromStream(
                    new java.io.ByteArrayInputStream(firebaseConfigJson.getBytes())
                );
            } else {
                // Fallback to file for local dev or if env var is missing
                InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json");
                if (serviceAccount == null) {
                    throw new RuntimeException("Firebase: serviceAccountKey.json not found in resources!");
                }
                credentials = GoogleCredentials.fromStream(serviceAccount);
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                return FirebaseApp.initializeApp(options);
            } else {
                return FirebaseApp.getInstance();
            }
        } catch (Exception e) {
            throw new RuntimeException("FATAL: Firebase initialization failed! Check your FIREBASE_CONFIG_JSON env var.", e);
        }
    }
}
