import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      app: 'VEXA Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
