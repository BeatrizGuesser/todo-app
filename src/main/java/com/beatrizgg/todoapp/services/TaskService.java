package com.beatrizgg.todoapp.services;

import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.beatrizgg.todoapp.models.Task;
import com.beatrizgg.todoapp.models.User;
import com.beatrizgg.todoapp.models.enums.ProfileEnum;
import com.beatrizgg.todoapp.models.projection.TaskProjection;
import com.beatrizgg.todoapp.repositories.TaskRepository;
import com.beatrizgg.todoapp.repositories.UserRepository;
import com.beatrizgg.todoapp.security.UserSpringSecurity;
import com.beatrizgg.todoapp.services.exceptions.AuthorizationException;
import com.beatrizgg.todoapp.services.exceptions.DataBindingViolationException;
import com.beatrizgg.todoapp.services.exceptions.ObjectNotFoundException;
import com.beatrizgg.todoapp.services.exceptions.TaskAlreadyDoneException;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    public Task findById(Long id) {
        Task task = this.taskRepository.findById(id).orElseThrow(() -> new ObjectNotFoundException(
                "Task not found! Id: " + id + ", Type: " + Task.class.getName()));

        UserSpringSecurity userSpringSecurity = UserService.authenticated();
        if (Objects.isNull(userSpringSecurity)
                || !userSpringSecurity.hasRole(ProfileEnum.ADMIN) && !userHasTask(userSpringSecurity, task))
            throw new AuthorizationException("Access denied!");

        return task;
    }

    public List<TaskProjection> findAllByUser() {
        UserSpringSecurity userSpringSecurity = UserService.authenticated();
        if (Objects.isNull(userSpringSecurity))
            throw new AuthorizationException("Access denied!");

        List<TaskProjection> tasks = this.taskRepository.findByUser_Id(userSpringSecurity.getId());
        return tasks;
    }

    public List<TaskProjection> findAllDoneByUser() {
        UserSpringSecurity userSpringSecurity = UserService.authenticated();
        if (Objects.isNull(userSpringSecurity))
            throw new AuthorizationException("Access denied!");

        List<TaskProjection> tasks = this.taskRepository.findByUser_IdAndDoneTrue(userSpringSecurity.getId());
        return tasks;
    }

    public List<TaskProjection> findAllUnDoneByUser() {
        UserSpringSecurity userSpringSecurity = UserService.authenticated();
        if (Objects.isNull(userSpringSecurity))
            throw new AuthorizationException("Access denied!");

        List<TaskProjection> tasks = this.taskRepository.findByUser_IdAndDoneFalse(userSpringSecurity.getId());
        return tasks;
    }

    @Transactional
    public Task create(Task obj) {
        UserSpringSecurity userSpringSecurity = UserService.authenticated();
        if (Objects.isNull(userSpringSecurity))
            throw new AuthorizationException("Access denied!");

        User user = this.userService.findById(userSpringSecurity.getId());
        obj.setId(null);
        obj.setDone(false);
        obj.setUser(user);
        obj = this.taskRepository.save(obj);

        user.setTasksLeft((int) user.getTasks().stream().filter(t -> !t.isDone()).count());
        user.setTasksTotal(user.getTasksLeft() + user.getTasksDone());
        this.userRepository.save(user);
        return obj;
    }

    @Transactional
    public Task update(Task obj) {
        Task newObj = findById(obj.getId());
        newObj.setDescription(obj.getDescription());
        return this.taskRepository.save(newObj);
    }

    @Transactional
    public Task done(Long id) {
        Task newObj = findById(id);
        newObj.setDone(true);
        Task task = this.taskRepository.save(newObj);

        User user = newObj.getUser();
        user.setTasksLeft((int) user.getTasks().stream().filter(t -> !t.isDone()).count());
        user.setTasksDone((int) user.getTasks().stream().filter(t -> t.isDone()).count());
        user.setTasksTotal(user.getTasksLeft() + user.getTasksDone());
        this.userRepository.save(user);
        return task;
    }

    public void delete(Long id) {
        Task task = findById(id);
        User user = task.getUser();
        if (task.isDone()) {
            throw new TaskAlreadyDoneException("Cannot delete a task that is already completed!");
        } else {
            try {
                this.taskRepository.deleteById(id);
                user.setTasksLeft((int) user.getTasks().stream().filter(t -> !t.isDone()).count());
                user.setTasksTotal(user.getTasksLeft() + user.getTasksDone());
                this.userRepository.save(user);
            } catch (Exception e) {
                throw new DataBindingViolationException("It is not possible to delete as there are related entities!");
            }
        }
    }

    private Boolean userHasTask(UserSpringSecurity userSpringSecurity, Task task) {
        return task.getUser().getId().equals(userSpringSecurity.getId());
    }

}
