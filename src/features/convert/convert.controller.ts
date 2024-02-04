import { Controller, UseInterceptors } from "@nestjs/common"
import { MessagePattern } from "@nestjs/microservices"
import { ConvertInput } from "./shared"
import ConvertService from "./convert.service"
import { SafeSerializableFileInterceptor } from "@global"

@Controller()
export default class ConvertController {
    constructor(
        private readonly convertService : ConvertService
    ) {}
    
    @UseInterceptors(SafeSerializableFileInterceptor)
    @MessagePattern("convert")
    async convert(input: ConvertInput) {
        return this.convertService.convert(input)
    }
}