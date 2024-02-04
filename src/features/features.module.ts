import { Module } from "@nestjs/common"
import { ConvertModule } from "./convert"

@Module({
    imports: [ConvertModule],
})
export default class FeaturesModule {}
