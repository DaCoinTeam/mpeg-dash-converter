import { NestFactory } from "@nestjs/core"
import AppModule from "./app.module"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.TCP,
            options: {
                host: "0.0.0.0",
                port: 3005,
            },
        },
    )
    await app.listen()
}
bootstrap()
