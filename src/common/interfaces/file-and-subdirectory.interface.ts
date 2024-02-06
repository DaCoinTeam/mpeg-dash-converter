import SerializableFile from "./serializable-file.interface"

export default interface FileAndSubdirectory {
    file: SerializableFile,
    subdir?: string, 
}