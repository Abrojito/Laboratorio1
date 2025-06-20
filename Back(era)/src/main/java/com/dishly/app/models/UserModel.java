package com.dishly.app.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
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

    @ManyToMany
    @JoinTable(
            name = "undesired_ingredients",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "ingredient_id")
    )
    private List<IngredientModel> undesiredIngredients = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "user_followers",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    private List<UserModel> followers = new ArrayList<>();

    @ManyToMany(mappedBy = "followers")
    private List<UserModel> following = new ArrayList<>();



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
