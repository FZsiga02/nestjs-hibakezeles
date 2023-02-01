/* eslint-disable prettier/prettier */
import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Render } from '@nestjs/common';
import { ChangeStream, DataSource } from 'typeorm';
import { AppService } from './app.service';
import RegisterDto from './register.dto';
import User from './user.entity';
import * as bcrypt from 'bcrypt';
import ChangeUserDto from './changeuser.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  @Render('index')
  index() {
    return { message: 'Welcome to the homepage' };
  }

  @Post('/register')
  
  async register(@Body() registerDto: RegisterDto) {
    if (
      !registerDto.email || 
      !registerDto.password || 
      !registerDto.passwordAgain
    ) {
      throw new BadRequestException('Every parameters are mandatory')
    }
    if (!registerDto.email.includes('@')) {
      throw new BadRequestException('Email must contain a @ character');
    }
    if (registerDto.password != registerDto.passwordAgain) {
      throw new BadRequestException('The two passwords must match')
    }
    if (registerDto.password.length < 8) {
      throw new BadRequestException('The password must be at least 8 characters long')
    }

    const userRepo = this.dataSource.getRepository(User);
    const user = new User();
    user.email = registerDto.email;
    user.password = await bcrypt.hash(registerDto.password, 15)
    await userRepo.save(user)

    delete user.password;

    //DB-be beszúrás
    const newUser = {
      id: 34,
      email: 'email@example.com',
    };
  }

  @Patch('/users/:id')
  async change(@Body() changeUserDto: ChangeUserDto, @Param('id') id: number) {
    if (!changeUserDto.newEmail) {
      throw new BadRequestException('The email address is mandatory')
    }
    if (!changeUserDto.newEmail.includes('@')) {
      throw new BadRequestException('The new email address must contain a @ character');
    }
    if (changeUserDto.newPictureUrl) {
      if (!changeUserDto.newPictureUrl.startsWith('http://') && !changeUserDto.newPictureUrl.startsWith('https://')) {
        throw new BadRequestException('The URL of the new picture must start with http:// or https://')
      }
    }

    const userRepo = this.dataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: id })
    user.email = changeUserDto.newEmail;
    user.profilePictureUrl = changeUserDto.newPictureUrl;
    await userRepo.save(user);

    delete user.password;
    
    return user;
  }
}
