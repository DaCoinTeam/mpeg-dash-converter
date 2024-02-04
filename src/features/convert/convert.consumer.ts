import { Job } from "bull"
import { OnQueueError, Process, Processor } from "@nestjs/bull"
import { ProcessService } from "@global"
import { TaskInfo } from "@common"

@Processor("tasks")
export default class ConvertConsumer {
    constructor(
        private readonly processService: ProcessService
    ) {}

    @Process()
    async process(job: Job<TaskInfo>) {
        await this.processService.processVideo(job.data)
        return {}
    }

    @OnQueueError()
    onError(err: Error) {
        console.error(err)
    }
}