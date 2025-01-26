import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';
import { UserService } from '@/server/UserService';

export async function POST(req: NextRequest) {
  try {
    const newUserData = await req.json();

    const existingUser = await UserService.findOneBy('email', newUserData.email);

    if (existingUser?.id) {
      return Response.json({ message: `Email already in use.` }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(newUserData.password, 8);
    const newlyCreatedUser = await UserService.create({ ...newUserData, password: hashedPassword });

    return Response.json({ newUser: newlyCreatedUser }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Error creating new user.' }, { status: 500 });
  }
}
