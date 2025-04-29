package com.dishly.app.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Getter
@Setter
public class UserModel implements UserDetails {

    @Id
    @GeneratedValue
    private Long id;

    @Column(unique=true)
    private String username;


    private String password;

    @Column(unique=true)
    private String email;

    @Setter
    @Getter
    private String fullName;

    @Setter
    @Getter
    @Column(columnDefinition = "TEXT")
    private String photo;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

}
