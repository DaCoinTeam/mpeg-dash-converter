import { AuthToken } from "../enums"

export default interface Payload {
  userId: string;
  type: AuthToken;
  iat: string;
  exp: string;
}
