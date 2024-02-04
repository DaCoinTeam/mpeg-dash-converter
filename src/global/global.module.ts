import { Global, Module } from "@nestjs/common"
import { AssetsManagerService, Bento4Service, CommandService, FfmpegSerivce, ProcessService } from "./services"

@Global()
@Module({
    imports: [],
    exports: [
        AssetsManagerService,
        Bento4Service,
        CommandService,
        FfmpegSerivce,
        ProcessService
    ],
    providers: [
        AssetsManagerService,
        Bento4Service,
        CommandService,
        FfmpegSerivce,
        ProcessService
    ],
})
export default class GlobalModule { }
