import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    // Multer file size error
    if ((exception as any)?.code === 'LIMIT_FILE_SIZE') {
      httpAdapter.reply(ctx.getResponse(), { success: false, message: 'El archivo es demasiado grande (máx 5MB)' }, 400);
      return;
    }

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();
      message = typeof response === 'string' ? response : (response as any).message || message;
    } else if (exception instanceof Error) {
      message = exception.message;
      console.error('Error no manejado:', exception);
    }

    httpAdapter.reply(
      ctx.getResponse(),
      { success: false, message },
      httpStatus,
    );
  }
}
