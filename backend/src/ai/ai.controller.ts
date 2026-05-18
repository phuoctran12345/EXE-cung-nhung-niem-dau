import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Endpoint để nhận request từ client và gọi AI
   * Method: POST /api/ai/recommend-tour
   */
  @Post('recommend-tour')
  async recommendTour(@Body() payload: any) {
    const { userInput, activities } = payload;
    
    // Gọi service AI để xử lý logic
    const result = await this.aiService.generateTourPlan(userInput, activities);
    
    return result;
  }

  /**
   * Endpoint để chat với AI và chỉnh sửa lịch trình
   * Method: POST /api/ai/chat-tour
   */
  @Post('chat-tour')
  async chatTour(@Body() payload: any) {
    const { messages, currentSchedule, dataset } = payload;
    
    // Gọi service AI để xử lý logic chat
    const result = await this.aiService.chatTourPlan(messages, currentSchedule, dataset);
    
    return result;
  }
}
