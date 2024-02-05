import { Catch, RpcExceptionFilter } from "@nestjs/common"
import { Observable, throwError } from "rxjs"
import { RpcException } from "@nestjs/microservices"

@Catch(RpcException)
export default class ExceptionFilter implements RpcExceptionFilter<RpcException> {
    catch(exception: RpcException): Observable<unknown> {
        return throwError(() => exception.getError())
    }
}