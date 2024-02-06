import { FileAndSubdirectory, Metadata, SerializableFile } from "@common"
import { Injectable, Logger } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"
import { promises as fsPromise } from "fs"
import { basename, dirname, extname, join } from "path"
import FfmpegService from "./ffmpeg.service"
import Bento4Service from "./bento4.service"
import { videoConfig } from "@config"
import { validate as validateUuidv4 } from "uuid"
import AssetsManagerService from "./assets-manager.service"

const MANIFEST_FILE_NAME = "manifest.mpd"

@Injectable()
export default class ProcessService {
    private readonly logger = new Logger(ProcessService.name)
    constructor(
        private readonly assetsManagerService: AssetsManagerService,
        private readonly ffmegService: FfmpegService,
        private readonly bento4Service: Bento4Service,
    ) { }

    private validateVideoExtension(fileName: string): boolean {
        const allowedExtensions = [
            ".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm"
        ]
        return allowedExtensions.includes(extname(fileName))
    }

    async createTask(file: SerializableFile): Promise<Metadata> {
        if (!this.validateVideoExtension(file.fileName)) throw new RpcException("Invalid video file extension")
        const metadata = await this.assetsManagerService.upload(file)
        await fsPromise.mkdir(join("tasks", metadata.assetId))
        await fsPromise.writeFile(join("tasks", metadata.assetId, metadata.fileName), file.fileBody)
        return metadata
    }

    private async uploadMpegDashManifestRecusive(path: string,
        fileAndSubdirectories: Array<FileAndSubdirectory> = [],
        sendPath?: string,
        insideNonRootDir: boolean = true) {
        const name = basename(path)
        const stat = await fsPromise.stat(path)
        if (stat.isDirectory()) {
            const isRoot = validateUuidv4(name)
            if ((!insideNonRootDir || isRoot || name === "video" || name === "audio")) {
                const childNames = await fsPromise.readdir(path)
                for (const childName of childNames) {
                    const childPath = join(path, childName)
                    const childSendPath = sendPath ? join(sendPath, childName) : childName
                    await this.uploadMpegDashManifestRecusive(childPath, fileAndSubdirectories, childSendPath, isRoot)
                }
            }
        } else {
            const isManifest = name === MANIFEST_FILE_NAME
            if (!insideNonRootDir || isManifest) {
                const fileBody = await fsPromise.readFile(path)
                fileAndSubdirectories.push({
                    file: {
                        fileName: name,
                        fileBody
                    },
                    subdir: !isManifest ? dirname(sendPath) : undefined
                })
            } 
        }
    }
    private async uploadMpegDashManifest(assetId: string) {
        const fileAndSubdirectories: Array<FileAndSubdirectory> = []
        const path = join(process.cwd(), "tasks", assetId)
        await this.uploadMpegDashManifestRecusive(path, fileAndSubdirectories)
        await this.assetsManagerService.update(assetId, fileAndSubdirectories)
        await this.assetsManagerService.uploadMetadata({
            assetId,
            fileName: MANIFEST_FILE_NAME,
            extname: extname(MANIFEST_FILE_NAME)
        })
    } 

    private async cleanUp(assetId: string) {
        const path = join(process.cwd(), "tasks", assetId)
        await fsPromise.rm(path, { recursive: true })
    }

    async processVideo(metadata: Metadata) {
        const { assetId, fileName } = metadata
        this.logger.verbose(`DOING TASK: ${assetId}`)
        this.logger.verbose("1/5. Encoding video at multiple bitrates...")
        await this.ffmegService.encodeAtMultipleBitrates(assetId, fileName)

        this.logger.verbose("2/5. Fragmenting videos...")
        const promises: Array<Promise<void>> = []
        for (const videoName of videoConfig().videoNames) {
            const promise = async () => {
                const fragmentationRequired = await this.bento4Service.checkFragments(assetId, videoName)
                if (fragmentationRequired) {
                    await this.bento4Service.fragmentVideo(assetId, videoName)
                }
            }
            promises.push(promise())
        }
        await Promise.all(promises)

        this.logger.verbose("3/5. Generating MPEG-DASH manifest...")
        await this.bento4Service.generateMpegDashManifestFromFragments(assetId, videoConfig().videoNames)

        this.logger.verbose("4/5. Uploading...")
        await this.uploadMpegDashManifest(assetId)

        this.logger.verbose("5/5. Cleaning up...")
        await this.cleanUp(assetId)
    }
}
