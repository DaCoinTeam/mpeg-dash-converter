import { Controller } from "@nestjs/common"
import { MessagePattern } from "@nestjs/microservices"
import { ConvertInput } from "./shared"
import ConvertService from "./convert.service"

@Controller()
export default class ConvertController {
    constructor(
        private readonly convertService : ConvertService
    ) {}
    
    @MessagePattern("convert")
    async convert(input: ConvertInput) {
        return this.convertService.convert(input)
    }
}