import AuthTokens from "./auth-tokens.interface"

export default interface Response<T extends object> {
  data: T;
  tokens?: AuthTokens;
}
