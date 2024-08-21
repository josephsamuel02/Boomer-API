import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UpdateUserDto } from "src/dtos/updateUser.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getLogedinUser(data: any) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          user_id: data.user_id,
        },
      });

      if (!user) {
        return new NotFoundException("user not found");
      }

      return { status: "success", data: user };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  async updateUserById(updateUserDto: UpdateUserDto) {
    try {
      const account = await this.prisma.user.findUnique({
        where: {
          user_id: updateUserDto.user_id,
        },
      });

      if (!account) {
        throw new NotFoundException({
          message: "failed to get account  ",
          status: "failed",
        });
      }

      const updateUser = await this.prisma.user.update({
        where: {
          user_id: updateUserDto.user_id,
        },
        data: updateUserDto,
      });

      if (!updateUser) {
        throw new BadRequestException({
          message: "failed to update user",
          status: "failed",
        });
      }
      delete updateUser.password;
      return { status: "success", data: updateUser };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  async getUserById(updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          user_id: updateUserDto.user_id,
        },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      delete user.password;

      return { status: 200, message: "Success", data: user };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  // Admin Endpoints
  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany();

      if (!users) {
        throw new NotFoundException("not found");
      }

      return { status: "success", data: users };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }
}
