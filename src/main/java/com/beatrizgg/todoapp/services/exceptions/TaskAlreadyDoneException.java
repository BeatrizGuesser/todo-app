package com.beatrizgg.todoapp.services.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class TaskAlreadyDoneException extends IllegalStateException {

    public TaskAlreadyDoneException(String message) {
        super(message);
    }
}