import { Module } from "@nestjs/common"
import ConvertController from "./convert.controller"
import ConvertService from "./convert.service"
import { BullModule } from "@nestjs/bull"
import ConvertConsumer from "./convert.consumer"

@Module({
    imports: [
        BullModule.registerQueue(
            {
                name: "convert",
            }
        ),
    ],
    controllers: [ConvertController],
    providers: [ConvertConsumer, ConvertService],
})
export default class ConvertModule { }