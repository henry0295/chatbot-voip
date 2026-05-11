import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { ChatRequest, ChatResponse } from './chat.types';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: ChatRequest): Promise<ChatResponse> {
    const message = body.message?.trim();
    if (!message) {
      throw new BadRequestException('El campo "message" es obligatorio.');
    }

    return this.chatService.reply({
      message,
      history: body.history ?? [],
    });
  }
}
