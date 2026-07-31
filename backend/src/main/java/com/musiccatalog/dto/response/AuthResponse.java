package com.musiccatalog.dto.response;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String email,
        String displayName
) {
    public static AuthResponse of(String token, Long userId, String email, String displayName) {
        return new AuthResponse(token, "Bearer", userId, email, displayName);
    }
}
