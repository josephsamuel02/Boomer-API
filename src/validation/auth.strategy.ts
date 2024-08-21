import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "src/module/auth/auth.service";

require("dotenv").config();

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignorExpiration: false,
      secretOrKey: process.env.JWT_SECRETE_KEY,
    });
  }

  async validate(payload: any): Promise<any> {
    if (!payload) {
      throw new UnauthorizedException({ message: "no payload" });
    }

    const userByuser_id = await this.authService.validateUser(
      payload.user_id,
      payload.password,
    );

    if (!userByuser_id) {
      throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);
    }
    return userByuser_id;
  }
}
