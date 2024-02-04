import { Metadata, SerializableFile, TaskInfo } from "@common"
import { Injectable, Logger } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"
import { promises } from "fs"
import { extname, join } from "path"
import FfmpegService from "./ffmpeg.service"
import Bento4Service from "./bento4.service"
import { videoConfig } from "@config"
import AssetsManagerService from "./assets-manager.service"

@Injectable()
export default class ProcessService {
    private readonly logger = new Logger(ProcessService.name)
    constructor(
        private readonly assetsManagerService: AssetsManagerService,
        private readonly ffmegService: FfmpegService,
        private readonly bento4Service: Bento4Service, 
    ) {}

    private validateVideoExtension(fileName: string) : boolean {
        const allowedExtensions = [
            ".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm"
        ]
        return allowedExtensions.includes(extname(fileName))
    }

    async createTask(file: SerializableFile) : Promise<Metadata>  {
        if (!this.validateVideoExtension(file.fileName)) throw new RpcException("Invalid video file extension")
        const metadata = await this.assetsManagerService.upload(file)
        await promises.mkdir(join("tasks", metadata.assetId))
        await promises.writeFile(join("tasks", metadata.assetId, metadata.fileName), file.fileBody)
        return metadata
    }

    async processVideo(metadata: Metadata) {
        const { assetId, fileName } = metadata
        this.logger.verbose("1/5. Encoding video at multiple bitrates...")
        await this.ffmegService.encodeAtMultipleBitrates(assetId, fileName)
        this.logger.verbose("2/5. Encoding video at multiple bitrates...")
        const fragmented = await this.bento4Service.checkFragments(assetId, fileName)
        if (!fragmented) {
            this.logger.verbose("2/5 - b. Fragmenting videos...")
            await this.bento4Service.fragmentVideo(assetId, fileName)
        }   
        this.logger.verbose("3/5. Generating MPEG-DASH manifest...")
        await this.bento4Service.generateMpegDashManifestFromFragments(assetId, videoConfig().videoNames)
    }   
}
