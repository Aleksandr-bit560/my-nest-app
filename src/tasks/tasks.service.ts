import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    data: { title: string; description?: string },
    userId: number,
  ): Promise<Task> {
    if (!data.title || data.title.trim() === '') {
      throw new BadRequestException('Title is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = this.tasksRepository.create({
      title: data.title.trim(),
      description: data.description?.trim(),
      user: user,
    });

    return this.tasksRepository.save(task);
  }

  async findAll(userId: number): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(
    id: number,
    data: { title?: string; description?: string; completed?: boolean },
    userId: number,
  ): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (data.title !== undefined) {
      if (!data.title || data.title.trim() === '') {
        throw new BadRequestException('Title cannot be empty');
      }
      task.title = data.title.trim();
    }

    if (data.description !== undefined) {
      task.description = data.description?.trim();
    }

    if (data.completed !== undefined) {
      task.completed = data.completed;
    }

    return this.tasksRepository.save(task);
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.tasksRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.tasksRepository.remove(task);
  }
}
