import { FileAndSubdirectory, Metadata, SerializableFile } from "@common"
import { servicesConfig } from "@config"
import { Injectable, OnModuleInit } from "@nestjs/common"
import {
    ClientProxy,
    ClientProxyFactory,
    Transport,
} from "@nestjs/microservices"
import { lastValueFrom } from "rxjs"

@Injectable()
export default class AssetsManagerService implements OnModuleInit {
    private client: ClientProxy
    onModuleInit() {
        this.client = ClientProxyFactory.create({
            transport: Transport.TCP,
            options: {
                host: servicesConfig().assetsManager.host,
                port: Number(servicesConfig().assetsManager.port),
            },
        })
    }

    async upload(file: SerializableFile) {
        return await lastValueFrom(this.client.send<Metadata>("upload",
            file
        ))
    }

    async update(assetId: string, fileAndSubdirectories: FileAndSubdirectory[]) {
        await lastValueFrom(this.client.send("update",
            {
                assetId, fileAndSubdirectories
            }
        ))
    }

    async uploadMetadata(metadata: Metadata) {
        await lastValueFrom(this.client.send("upload-metadata", metadata))
    }
}
  