import { Controller, Post, Body, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/dtos/createUser.dto";
import { LoginUserDto } from "src/dtos/loginUser.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  create(@Body() body: CreateUserDto) {
    const result = this.authService.createUser(body);
    return result;
  }

  @Post("login")
  public async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
    return await this.authService.login(loginUserDto);
  }
}
