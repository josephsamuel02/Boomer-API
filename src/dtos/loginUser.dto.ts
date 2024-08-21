import { IsString, IsNotEmpty, IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class LoginUserDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  readonly password: string;
}

export class UpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  new_password: string;

  @ApiProperty()
  @IsNotEmpty()
  old_password: string;
}
