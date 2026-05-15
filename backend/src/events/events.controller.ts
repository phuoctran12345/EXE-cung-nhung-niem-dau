import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events') // Đường dẫn API: /events
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get() // Lấy tất cả sự kiện (GET /events)
  async findAll() {
    return this.eventsService.findAll();
  }

  @Post() // Tạo sự kiện mới (POST /events)
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get(':id') // Lấy chi tiết sự kiện theo ID (GET /events/:id)
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }
}
