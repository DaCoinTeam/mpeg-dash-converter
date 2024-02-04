import { SerializableFile, TaskInfo } from "@common"
import { Injectable, Logger } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"
import { promises } from "fs"
import { extname, join } from "path"
import { v4 as uuidv4 } from "uuid"
import FfmpegService from "./ffmpeg.service"
import Bento4Service from "./bento4.service"
import videoConfig from "src/config/video.config"

@Injectable()
export default class ProcessService {
    private readonly logger = new Logger(ProcessService.name)
    constructor(
        private readonly ffmegService: FfmpegService,
        private readonly bento4Service: Bento4Service, 
    ) {}

    private validateVideoExtension(fileName: string) : boolean {
        const allowedExtensions = [
            ".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm"
        ]
        return allowedExtensions.includes(extname(fileName))
    }

    async createTask(file: SerializableFile) : Promise<TaskInfo>  {
        if (!this.validateVideoExtension(file.fileName)) throw new RpcException("Invalid video file extension")
        const taskId = uuidv4()
        await promises.mkdir(join("tasks", taskId))
        await promises.writeFile(join("tasks", taskId, file.fileName), file.fileBody)

        return {
            taskId,
            videoName: file.fileName
        }
    }

    async processVideo(taskInfo: TaskInfo) {
        const { taskId, videoName } = taskInfo
        this.logger.verbose("1/5. Encoding video at multiple bitrates...")
        await this.ffmegService.encodeAtMultipleBitrates(taskId, videoName)
        this.logger.verbose("2/5. Encoding video at multiple bitrates...")
        const fragmented = await this.bento4Service.checkFragments(taskId, videoName)
        if (!fragmented) {
            this.logger.verbose("2/5 - b. Fragmenting videos...")
            await this.bento4Service.fragmentVideo(taskId, videoName)
        }   
        this.logger.verbose("3/5. Generating MPEG-DASH manifest...")
        await this.bento4Service.generateMpegDashManifestFromFragments(taskId, videoConfig().videoNames)
    }   
}
