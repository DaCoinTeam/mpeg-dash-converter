import { Injectable } from "@nestjs/common"
import { exec } from "child_process"

@Injectable()
export default class CommandService {
    async execute(command: string) : Promise<string> {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error)
                }
                if (stderr) {
                    reject(stderr)
                }
                resolve(stdout)
            })
        })
    }
}