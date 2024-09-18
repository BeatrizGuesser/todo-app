package com.beatrizgg.todoapp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.beatrizgg.todoapp.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

}
