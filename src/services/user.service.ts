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
    if (data.status) {
      updateData.status = data.status;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('At least one field must be provided');
    }

    const updatedUser = await userRepository.updateUser(userId, updateData);
    return updatedUser;
  }
}
