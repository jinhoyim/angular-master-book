import { Thread } from '../thread/thread.model';
import { User } from '../user/user.model';

export class Message {
  public readonly thread: Thread;
  public isRead: boolean;
  public readonly author: User;
  public readonly text: string;
  constructor(msg: { author: User; text: string; thread: Thread }) {
    this.author = msg.author;
    this.text = msg.text;
    this.thread = msg.thread;
    this.isRead = false;
  }
}
