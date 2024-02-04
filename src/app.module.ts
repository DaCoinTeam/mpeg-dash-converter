import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { servicesConfig } from "@config"
import { GlobalModule } from "@global"
import { FeaturesModule } from "@features"
import videoConfig from "./config/video.config"
import { BullModule } from "@nestjs/bull"

@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: "0.0.0.0",
                port: 6379,
            }
        }), 
        BullModule.registerQueue(
            {
                name: "tasks",
            }
        ),
        ConfigModule.forRoot({
            load: [servicesConfig, videoConfig],
        }),

        GlobalModule,
        FeaturesModule,
    ],
    controllers: [],
    providers: [
    ],
})
export default class AppModule {}
