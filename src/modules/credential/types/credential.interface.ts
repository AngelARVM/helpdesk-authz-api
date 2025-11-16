export interface ICredential {
  id: string;

  type: string;

  key: string;

  createdAt: Date;

  expiredAt?: Date;
}
