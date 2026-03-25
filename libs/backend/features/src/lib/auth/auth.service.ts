import { ChangePasswordDto, LoginDto } from '@lingua/dto';
import { User, UserDocument } from '@lingua/schemas';
import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ICreateUser, Id } from '@lingua/api';
import { NeoOperationsService } from '../neo4j/neo-operations.service';

@Injectable()
export class AuthService {
  
  private TAG = 'AuthService';

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private neoService: NeoOperationsService
  ) {}

  async login(loginDto: LoginDto) {
    Logger.log('login', this.TAG);
    
    const user = await this.userModel
    .findOne({
      email: loginDto.email,
    })
      .exec();
      
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );
    
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return { access_token: this.jwtService.sign(payload) };
  }
  
  async register(registerDto: ICreateUser) {
    Logger.log('register', this.TAG);
    
    const existingUser = await this.userModel
      .findOne({
        email: registerDto.email,
      })
      .exec();

    if (existingUser) throw new UnauthorizedException('Email already exists');

    const hashedPassword = await bcrypt.hashSync(registerDto.password, 10);

    const user = await this.userModel.create({
      email: registerDto.email,
      firstname: registerDto.firstname,
      lastname: registerDto.lastname,
      role: registerDto.role,
      password: hashedPassword,
    });

    await this.neoService.mergeUser(user)

    const payload = { sub: user._id, email: user.email, role: user.role };
    
    return { access_token: this.jwtService.sign(payload) };
  }

  async changePassword(changePasswordDto: ChangePasswordDto, id: Id) {
    Logger.log('changePassowrd', this.TAG);

    const existingUser = await this.userModel.findById(id);

    if(!existingUser) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, existingUser.password)

    if(!isMatch) throw new HttpException('Old pasword is incorrect', HttpStatus.BAD_REQUEST);

    const HashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    existingUser.password = HashedNewPassword;
    await existingUser.save();

    Logger.log('Password updates succesfully', this.TAG);

    return { message: 'Passwrd updated succesfully'}
  }
}
