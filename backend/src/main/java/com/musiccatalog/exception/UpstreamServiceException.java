package com.musiccatalog.exception;

/** Thrown when a third-party dependency (the iTunes API) fails or times out. */
public class UpstreamServiceException extends RuntimeException {
    public UpstreamServiceException(String message) {
        super(message);
    }
}
