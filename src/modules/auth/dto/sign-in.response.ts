import { ApiProperty } from '@nestjs/swagger';

export class SingInResponseDTO {
  @ApiProperty()
  accessToken: string;
}
