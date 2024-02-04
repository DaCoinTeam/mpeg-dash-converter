import SerializableFile from "./serializable-file.interface"

export default interface SerializableFormData<T extends object> {
    data: T,
    files: SerializableFile[]
}