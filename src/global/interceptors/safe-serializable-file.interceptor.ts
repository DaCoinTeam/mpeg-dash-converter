import { SerializableFile } from "@common"
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Observable } from "rxjs"

@Injectable()
export default class SafeSerializableFileInterceptor
implements NestInterceptor
{
    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<unknown>> {
        const data = context.switchToRpc().getData<SerializableFile>()
        data.fileBody = Buffer.from(data.fileBody)
        return next.handle()
    }
}