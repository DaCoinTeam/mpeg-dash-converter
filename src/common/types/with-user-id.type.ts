type WithUserId<T extends object> = T & { userId: string }

export default WithUserId