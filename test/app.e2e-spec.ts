import { INestApplication } from "@nestjs/common"
import { ClientProxy, ClientsModule, Transport } from "@nestjs/microservices"
import { TestingModule, Test } from "@nestjs/testing"
import AppModule from "../src/app.module"
import { lastValueFrom } from "rxjs"
import { readFileSync } from "fs"

describe("App", () => {
    let app: INestApplication
    let client: ClientProxy

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AppModule,
                ClientsModule.register([
                    { name: "clientToken", transport: Transport.TCP },
                ]),
            ],
        }).compile()

        app = moduleFixture.createNestApplication()

        app.connectMicroservice({
            transport: Transport.TCP,
        })

        await app.startAllMicroservices()
        await app.init()

        client = app.get("clientToken")
        await client.connect()
    })

    afterAll(async () => {
        await app.close()
        client.close()
    })

    // describe("Test upload", () => {
    //     it("Should upload success", async () => {
    //         const fakeBuffer = Buffer.from("This is a fake buffer for testing")
    //         const res = await client
    //             .send("upload", {
    //                 fileName: "hentaiz.json",
    //                 fileBody: fakeBuffer,
    //             })
    //             .toPromise()
    //         console.log(res)
    //     })
    // })

    describe("Test upload", () => {
        it("Should get success", async () => {
            const abc = readFileSync("video.mkv")
            const res = await lastValueFrom(client
                .send("convert", {
                    fileName: "video.mkv",
                    fileBody: abc,
                }))
            console.log(res)
        })
    })
})
