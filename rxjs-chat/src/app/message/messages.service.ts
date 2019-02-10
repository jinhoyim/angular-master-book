import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { scan, publishReplay, refCount, map, filter } from 'rxjs/operators';
import { Thread } from '../thread/thread.model';
import { Message } from './message.model';
import { User } from '../user/user.model';

const initialMessages: Message[] = [];

type IMessagesOperation = (messages: Message[]) => Message[];

@Injectable()
export class MessagesService {
  // 새 메시지를 한 번만 게시하는 스트림
  newMessages: Subject<Message> = new Subject<Message>();

  // 최신 메시지 배열을 배출하는 스트림
  messages: Observable<Message[]> = new Subject<Message[]>();

  // messages에 적용될 operations를 받음
  updates: Subject<any> = new Subject<any>();

  // 동작 스트림
  create: Subject<Message> = new Subject<Message>();
  markThreadAsRead: Subject<any> = new Subject<any>();

  constructor() {
    this.messages = this.updates.pipe(
      scan((messages: Message[], operation: IMessagesOperation) => {
        return operation(messages);
      }, initialMessages),
      publishReplay(1),
      refCount()
    );

    this.create
      .pipe(
        map(
          (message: Message): IMessagesOperation => {
            return (messages: Message[]) => {
              return messages.concat(message);
            };
          }
        )
      )
      .subscribe(this.updates);

    this.newMessages.subscribe(this.create);

    this.markThreadAsRead
      .pipe(
        map((thread: Thread) => {
          return (messages: Message[]) => {
            return messages.map((message: Message) => {
              // 직접 변경하는 문제
              if (message.thread.id === thread.id) {
                message.isRead = true;
              }
              return message;
            });
          };
        })
      )
      .subscribe(this.updates);
  }

  // 동작 스트림의 함수 호출
  addMessage(message: Message): void {
    this.newMessages.next(message);
  }

  messagesForThreadUser(thread: Thread, user: User): Observable<Message> {
    return this.newMessages.pipe(
      filter((message: Message) => {
        return message.thread.id === thread.id && message.author.id !== user.id;
      })
    );
  }
}

export const messagesServiceInjectables: Array<any> = [MessagesService];
