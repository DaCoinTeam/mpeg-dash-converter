import { Injectable } from "@nestjs/common"
import { ConvertInput } from "./shared/inputs"
import { InjectQueue } from "@nestjs/bull"
import { Queue } from "bull"
import { ProcessService } from "@global"

@Injectable()
export default class ConvertService {
    constructor(
        private readonly processService: ProcessService,
        @InjectQueue("convert") private readonly convertQueue: Queue
    ) { }

    async convert(input: ConvertInput) {
        const { fileName, fileBody } = input
        const metadata = await this.processService.createTask({
            fileName,
            fileBody: Buffer.from(fileBody)
        })
        await this.convertQueue.add(metadata)
        return metadata
    }
}  