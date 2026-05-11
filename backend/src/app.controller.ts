import { Controller, Get } from '@nestjs/common';
import { AppInfo, AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo(): AppInfo {
    return this.appService.getInfo();
  }
}
