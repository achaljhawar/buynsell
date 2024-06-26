// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { parseJwt } from '@/lib/utils';

type Data = {
  message: string;
  data?: any;
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

    const { chatroom_id } = req.body;
    // Check if the chatroom_id is provided
    if (!chatroom_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Fetch messages from the database
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chatroom_id', chatroom_id);

    // Handle errors
    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({
        message: 'Error fetching messages',
        error: error.message,
      });
    }

    // Handle empty response

    // Return the fetched messages
    return res.status(200).json({
      message: 'Messages fetched successfully',
      data: messages,
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}