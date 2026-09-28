package com.edutrack.edutrack.exception;


/*
 * Exception métier générique
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
