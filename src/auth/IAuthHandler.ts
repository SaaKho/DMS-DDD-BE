export interface IAuthHandler {
  login(username: string, password: string): Promise<string>;
  verify(token: string): Promise<boolean>;
  decode(
    token: string
  ): Promise<{ id: string; username: string; role: string }>;
}
