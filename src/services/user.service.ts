import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();

export class UserService {
  async getUserProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUserProfile(userId: string, data: any) {
    const updateData: any = {};
    if (data.firstName) {
      updateData.firstName = data.firstName;
    }
    if (data.lastName) {
      updateData.lastName = data.lastName;
    }
    if (data.phone) {
      updateData.phone = data.phone;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('At least one field must be provided');
    }

    try {
      const updatedUser = await userRepository.updateUser(userId, updateData);
      return updatedUser;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  }
}
