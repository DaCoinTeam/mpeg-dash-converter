import { Injectable } from "@nestjs/common"
import { join } from "path"
import CommandService from "./command.service"
import { RpcException } from "@nestjs/microservices"

@Injectable()
export default class Bento4Service {
    constructor(
        private readonly commandService: CommandService
    ) {}

    async checkFragments(taskId: string, videoName: string) {
        const videoPath = join("tasks", taskId, videoName)
    
        const execResult = await this.commandService.execute(`mp4info.exe "${videoPath}"`)
        const lines = execResult.split("\n")
    
        for (const line in lines) {
            const lineData = lines[line].toString()
    
            if (lineData.includes("fragments:  yes")) {
                return false
            }
    
            if (lineData.includes("fragments:  no")) {
                return true
            }

            if (lineData.includes("No movie found in the file")) {
                throw new RpcException("No movie found in the file.")
            }
        }
    }
    
    async fragmentVideo(taskId: string, videoName: string) {
        const videoPath = join("tasks", taskId, videoName)
        const outputDir = join(
            "tasks", taskId,
            `${videoName}_fragmented`,
        )

        const execResult = await this.commandService.execute(
            `mp4fragment.exe --fragment-duration 4000 "${videoPath}" "${outputDir}"`,
        )

        const lines = execResult.split("\n")
    
        for (const line in lines) {
            const lineData = line.toString()
    
            if (lineData.includes("ERROR"))
                throw new RpcException("Line data includes ERROR.")
        }
    }

    async generateMpegDashManifestFromFragments(taskId: string, fragmentedVideoNames: string[]) {
        const fragmentedPaths = fragmentedVideoNames.map((videoName) =>
            join("tasks", taskId, `${videoName}_fragmented`),
        )
        const line = fragmentedPaths.map((path) => `"${path}"`).join(" ")
    
        //output same file
        const outputDir = join("tasks", taskId)
    
        const execResult = await this.commandService.execute(
            `mp4dash.bat --mpd-name manifest.mpd ${line} -o "${outputDir}" --use-segment-timeline --subtitles --force`,
        )
        const lines = execResult.split("\n")
    
        for (const line in lines) {
            const lineData = lines[line].toString()
    
            if (lineData.includes("ERROR"))
                throw new RpcException("Line data includes error.")
        }
    }
}