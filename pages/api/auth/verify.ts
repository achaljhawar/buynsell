// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { parseJwt } from '@/lib/utils';

type Data = {
  message: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    // Check if the request method is POST
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    // Check if the Authorization header is present and valid
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Invalid token', error: 'Invalid token' });
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid token', error: 'Invalid token' });
    }

    // Parse the JWT token
    const decoded = parseJwt(token);

    // Check if the decoded token is valid
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token', error: 'Invalid token' });
    }

    const { hashedPassword, email, exp } = decoded;
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the token has expired
    if (exp < currentTime) {
      return res.status(401).json({ message: 'Token expired', error: 'Token expired' });
    }

    // Fetch user data from the database
    const { data: userData, error: userError } = await supabase
      .from('auth-user')
      .select('*')
      .eq('email', email)
      .eq('password', hashedPassword)
      .single();

    if (userError) {
      console.error('Database Error:', userError);
      return res.status(500).json({ message: 'Database Error' });
    }

    // Check if user data is valid
    if (userData) {
      return res.status(200).json({ message: 'User Verified' });
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}