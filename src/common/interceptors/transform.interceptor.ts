import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// 定义业务响应结构接口
interface BusinessResponse<T = any> {
  code?: number;
  message?: string;
  data?: T;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 如果业务代码返回了包含 code 的对象，则使用自定义状态
        if (typeof data === 'object' && data !== null && 'code' in data) {
          const res = data as BusinessResponse;
          return {
            success: res.code === 0, // 约定 200 为成功状态
            code: res.code,
            message: res.message || (res.code === 200 ? 'ok' : '操作失败'),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: res.data,
            timestamp: new Date().getTime(),
          };
        }

        // 否则默认返回成功状态
        return {
          success: true,
          code: 0,
          message: 'ok',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: data,
          timestamp: new Date().getTime(),
        };
      }),
    );
  }
}
