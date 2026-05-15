import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  // Inject Model Event để thao tác với DB
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  // Lấy danh sách tất cả sự kiện
  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  // Tạo một sự kiện mới
  async create(createEventDto: CreateEventDto): Promise<Event> {
    const createdEvent = new this.eventModel(createEventDto);
    return createdEvent.save();
  }

  // Tìm một sự kiện theo ID
  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) throw new NotFoundException('Không tìm thấy sự kiện');
    return event;
  }
}
