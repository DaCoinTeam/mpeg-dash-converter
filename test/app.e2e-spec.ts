import { INestApplication } from "@nestjs/common"
import { ClientProxy, ClientsModule, Transport } from "@nestjs/microservices"
import { TestingModule, Test } from "@nestjs/testing"
import AppModule from "../src/app.module"
import { lastValueFrom } from "rxjs"

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

    describe("Test get", () => {
        it("Should get success", async () => {
            const res = await lastValueFrom(client
                .send("get", {
                    assetIdOrPath: "cd3420d1-692e-4353-b129-33a411c17c70",
                }))
            console.log(res)
        })
    })
})
