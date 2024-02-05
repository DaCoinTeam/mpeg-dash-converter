import { Global, Module } from "@nestjs/common"
import { AssetsManagerService, Bento4Service, FfmpegSerivce, ProcessService } from "./services"

@Global()
@Module({
    imports: [],
    exports: [
        AssetsManagerService,
        Bento4Service,
        FfmpegSerivce,
        ProcessService
    ],
    providers: [
        AssetsManagerService,
        Bento4Service,
        FfmpegSerivce,
        ProcessService
    ],
})
export default class GlobalModule { }
