package com.dishly.app.controllers;

import com.dishly.app.dto.MealPrepRequestDTO;
import com.dishly.app.dto.MealPrepResponseDTO;
import com.dishly.app.dto.PagedResponse;
import com.dishly.app.services.MealPrepService;
import com.dishly.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("/api/mealpreps")
public class MealPrepController {

    private final MealPrepService mealPrepService;
    private final UserService userService;

    public MealPrepController(MealPrepService mealPrepService, UserService userService) {
        this.mealPrepService = mealPrepService;
        this.userService = userService;
    }

//    @GetMapping
//    public List<MealPrepResponseDTO> getAllPublic() {
//        return mealPrepService.getPublic();
//    }

    @GetMapping           // /api/mealpreps?page=&size=
    public Page<MealPrepResponseDTO> getAllPublic(Pageable pageable, Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        return mealPrepService.getPublic(pageable, email);
    }

    @GetMapping("/cursor")
    public PagedResponse<MealPrepResponseDTO> getAllPublicByCursor(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit,
            Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        return mealPrepService.getPublicByCursor(cursor, limit, email);
    }

    @GetMapping("{id}")
    public MealPrepResponseDTO getById(@PathVariable Long id) {
        return mealPrepService.getById(id);
    }

    @GetMapping("/search")
    public List<MealPrepResponseDTO> searchMealPreps(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String ingredient,
            @RequestParam(required = false) String author,
            Authentication auth
    ) {
        String email = auth != null ? auth.getName() : null;
        return mealPrepService.search(name, ingredient, author, email);
    }

    @GetMapping("/search/cursor")
    public PagedResponse<MealPrepResponseDTO> searchMealPrepsByCursor(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String ingredient,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "false") boolean onlyFollowing,
            @RequestParam(defaultValue = "false") boolean excludeUndesired,
            Authentication auth
    ) {
        String email = auth != null ? auth.getName() : null;
        return mealPrepService.searchByCursor(name, ingredient, author, cursor, limit, email, onlyFollowing, excludeUndesired);
    }


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MealPrepResponseDTO create(Authentication auth, @RequestBody @Valid MealPrepRequestDTO dto) {
        return mealPrepService.create(dto, auth.getName());
    }

    @PutMapping("{id}")
    public MealPrepResponseDTO update(@PathVariable Long id, Authentication auth,
                                      @RequestBody @Valid MealPrepRequestDTO dto) throws AccessDeniedException {
        return mealPrepService.update(id, dto, auth.getName());
    }

    @DeleteMapping("{id}")
    public void delete(@PathVariable Long id, Authentication auth) throws AccessDeniedException {
        mealPrepService.delete(id, auth.getName());
    }

    @GetMapping("/user/{userId}")
    public List<MealPrepResponseDTO> getByUser(@PathVariable Long userId, Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        return mealPrepService.getAllByUser(userId, email);
    }
}
