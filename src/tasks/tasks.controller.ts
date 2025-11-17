import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    username: string;
    roles: string[];
  };
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.tasksService.findAll(req.user.userId);
  }

  @Post()
  create(
    @Body() body: { title: string; description?: string },
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.create(body, req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title?: string; description?: string; completed?: boolean },
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.update(id, body, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.remove(id, req.user.userId);
  }
}
