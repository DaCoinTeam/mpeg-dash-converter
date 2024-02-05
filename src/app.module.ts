import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { servicesConfig } from "@config"
import { ExceptionFilter, GlobalModule } from "@global"
import { FeaturesModule } from "@features"
import videoConfig from "./config/video.config"
import { BullModule } from "@nestjs/bull"
import { APP_FILTER } from "@nestjs/core"


@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: "0.0.0.0",
                port: 6379,
            }
        }), 
        ConfigModule.forRoot({
            load: [servicesConfig, videoConfig],
        }),

        GlobalModule,
        FeaturesModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_FILTER,
            useClass: ExceptionFilter
        }
    ]
})
export default class AppModule {}
