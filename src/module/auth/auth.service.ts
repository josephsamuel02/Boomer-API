import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { EncryptionService } from "../../shared";
import { CreateUserDto } from "src/dtos/createUser.dto";
import { LoginUserDto } from "src/dtos/loginUser.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
  ) {}

  public async createUser(createUserDto: CreateUserDto): Promise<any> {
    try {
      // Check if user already exists
      const userExist = await this.prisma.user.findFirst({
        where: {
          email: createUserDto.email,
        },
      });

      if (userExist) {
        throw new BadRequestException({
          message: "User with this email already exists",
        });
      }

      const { user_name, email, password } = createUserDto;

      const encryptedPass = await this.encryptionService.hashPassword(password);

      const createAuth = await this.prisma.user.create({
        data: {
          user_id: `${user_name + Math.random().toString(36).slice(2)}`,
          user_name: user_name,
          email: email,
          password: `${encryptedPass}`,
        },
      });

      if (!createAuth) {
        throw new BadRequestException({
          message: "Unable to create user account",
        });
      }

      const signedUserToken = this.jwtService.sign({
        user_name: user_name,
        password: createAuth.password,
      });

      delete createAuth.password;

      // Create user account information
      const userAccount = {
        ...createAuth,
      };

      return {
        status: 200,
        message: "Boomer account created successfully",
        data: userAccount,
        token: signedUserToken,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const userExist = await this.prisma.user.findFirst({
        where: {
          email: loginUserDto.email,
        },
      });

      if (!userExist) {
        throw new NotFoundException(
          `No user found for email: ${loginUserDto.email}`,
        );
      }

      const isPasswordValid = this.encryptionService.comparePasswords(
        loginUserDto.password,
        userExist.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException({ message: "invalid credentials" });
      }

      const signedUserToken = this.jwtService.sign({
        user_id: userExist.user_id,
        password: userExist.password,
      });

      delete userExist.password;

      return {
        status: 200,
        data: userExist,
        token: signedUserToken,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  async validateUser(user_id: any, password: any) {
    try {
      const userExistByuser_id = await this.prisma.user.findFirst({
        where: {
          user_id: user_id,
        },
      });

      if (!userExistByuser_id) {
        throw new UnauthorizedException({ message: "can not find user" });
      } else {
        const decryptedPass = await this.encryptionService.comparePasswords(
          userExistByuser_id.password,
          password,
        );

        if (decryptedPass) {
          throw new UnauthorizedException({ message: "invalid credentials" });
        }

        //  delete userExistByuser_id.password;
        return userExistByuser_id;
      }
    } catch (error) {
      throw new BadRequestException({
        error: error,
        message: "unable to validate user",
      });
    }
  }
}
