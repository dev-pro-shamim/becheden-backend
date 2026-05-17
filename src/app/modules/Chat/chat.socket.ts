import httpStatus from 'http-status';
import { Namespace, Socket } from 'socket.io';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { verifyToken } from '../../lib';
import config from '../../config';
import UserModel from '../User/user.model';
import { ROLE } from '../User/user.constant';
import { ChatService } from './chat.service';
import { IUser } from '../User/user.interface';

type Tack = (payload: {
  success: boolean;
  message: string;
  data?: unknown;
  meta?: unknown;
  errorSources?: unknown[];
}) => void;

const ackError = (ack: Tack | undefined, err: unknown) => {
  if (!ack) return;

  if (err instanceof Error) {
    const anyErr = err as unknown as {
      statusCode?: number;
      errorSources?: unknown[];
      errors?: unknown[];
    };

    const errorSources =
      (anyErr.errorSources as unknown[]) || (anyErr.errors as unknown[]) || [];

    ack({
      success: false,
      message: err.message,
      errorSources,
    });
    return;
  }

  ack({
    success: false,
    message: 'Something went wrong!',
    errorSources: [{ path: '', message: 'Something went wrong!' }],
  });
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== 'object' || value === null) return null;
  return value as Record<string, unknown>;
};

const getStringField = (value: unknown, field: string): string | undefined => {
  const rec = asRecord(value);
  if (!rec) return undefined;
  const v = rec[field];
  return typeof v === 'string' ? v : undefined;
};

const getBooleanField = (
  value: unknown,
  field: string
): boolean | undefined => {
  const rec = asRecord(value);
  if (!rec) return undefined;
  const v = rec[field];
  return typeof v === 'boolean' ? v : undefined;
};

const ensureAuth = async (socket: Socket) => {
  const token =
    (socket.handshake.auth?.token as string | undefined) ||
    (socket.handshake.headers?.authorization as string | undefined)?.replace(
      'Bearer ',
      ''
    ) ||
    '';

  if (!token) {
    const err = new Error('You are not authorized!');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).data = { statusCode: httpStatus.UNAUTHORIZED };
    throw err;
  }

  const decoded = verifyToken(token, config.jwt.access_secret!) as JwtPayload;
  const { _id, iat } = decoded;

  const user = await UserModel.findById(_id);
  if (!user) {
    const err = new Error('User not exists!');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).data = { statusCode: httpStatus.UNAUTHORIZED };
    throw err;
  }

  if (!user.isActive || user.isDeleted || !user.isVerifiedByOTP) {
    const err = new Error('You are not authorized!');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).data = { statusCode: httpStatus.UNAUTHORIZED };
    throw err;
  }

  if (user.passwordChangedAt && user.isJWTIssuedBeforePasswordChanged(iat)) {
    const err = new Error('You are not authorized!');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).data = { statusCode: httpStatus.UNAUTHORIZED };
    throw err;
  }

  return user;
};

export const registerChatNamespace = (chatNsp: Namespace) => {
  chatNsp.use(async (socket, next) => {
    try {
      const user = await ensureAuth(socket);

      // store user on socket data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (socket.data as any).user = user;
      next();
    } catch (e) {
      next(e as Error);
    }
  });

  chatNsp.on('connection', (socket) => {
    const user = (socket.data as unknown as { user?: IUser }).user;

    socket.on(
      'chat:conversation:upsert',
      async (payload: unknown, ack?: Tack) => {
        try {
          if (!user) {
            throw new Error('You are not authorized!');
          }

          const adId = getStringField(payload, 'adId');
          const participantId = getStringField(payload, 'participantId');

          if (!adId || !participantId) {
            if (ack) {
              ack({
                success: false,
                message: 'adId and participantId are required!',
                errorSources: [
                  { path: 'adId', message: 'adId is required!' },
                  {
                    path: 'participantId',
                    message: 'participantId is required!',
                  },
                ],
              });
            }
            return;
          }

          const result = await ChatService.upsertConversationInDB(user, {
            adId,
            participantId,
          });

          if (ack) {
            ack({
              success: true,
              message: 'Conversation retrieved successfully!',
              data: result,
            });
          }
        } catch (e) {
          ackError(ack, e);
        }
      }
    );

    socket.on(
      'chat:conversation:list',
      async (payload: unknown, ack?: Tack) => {
        try {
          if (!user) {
            throw new Error('You are not authorized!');
          }

          const rec = asRecord(payload) ?? {};
          const result = await ChatService.listMyConversationsFromDB(user, rec);

          if (ack) {
            ack({
              success: true,
              message: 'Conversations retrieved successfully!',
              data: result.data,
              meta: result.meta,
            });
          }
        } catch (e) {
          ackError(ack, e);
        }
      }
    );

    socket.on(
      'chat:conversation:join',
      async (payload: unknown, ack?: Tack) => {
        const conversationId = getStringField(payload, 'conversationId');
        if (!conversationId) {
          if (ack) {
            ack({
              success: false,
              message: 'conversationId is required!',
              errorSources: [
                {
                  path: 'conversationId',
                  message: 'conversationId is required!',
                },
              ],
            });
          }
          return;
        }

        try {
          if (!user) {
            throw new Error('You are not authorized!');
          }

          await ChatService.ensureParticipant(
            new Types.ObjectId(user._id),
            conversationId
          );

          await socket.join(conversationId);
          if (ack) {
            ack({
              success: true,
              message: 'Joined conversation successfully!',
              data: { conversationId },
            });
          }
        } catch (e) {
          ackError(ack, e);
        }
      }
    );

    socket.on('chat:message:list', async (payload: unknown, ack?: Tack) => {
      try {
        if (!user) {
          throw new Error('You are not authorized!');
        }

        const conversationId = getStringField(payload, 'conversationId');
        if (!conversationId) {
          if (ack) {
            ack({
              success: false,
              message: 'conversationId is required!',
              errorSources: [
                {
                  path: 'conversationId',
                  message: 'conversationId is required!',
                },
              ],
            });
          }
          return;
        }

        const rec = asRecord(payload) ?? {};
        const result = await ChatService.listMessagesFromDB(
          user,
          conversationId,
          rec
        );

        if (ack) {
          ack({
            success: true,
            message: 'Messages retrieved successfully!',
            data: result,
          });
        }
      } catch (e) {
        ackError(ack, e);
      }
    });

    socket.on('chat:message:send', async (payload: unknown, ack?: Tack) => {
      try {
        if (!user) {
          throw new Error('You are not authorized!');
        }

        const conversationId = getStringField(payload, 'conversationId');
        const text = getStringField(payload, 'text');

        if (!conversationId) {
          if (ack) {
            ack({
              success: false,
              message: 'conversationId is required!',
              errorSources: [
                {
                  path: 'conversationId',
                  message: 'conversationId is required!',
                },
              ],
            });
          }
          return;
        }

        const attachmentRaw =
          (asRecord(payload)?.attachment as unknown) || undefined;
        const attachmentRec = asRecord(attachmentRaw);
        const attachmentType = attachmentRec
          ? (attachmentRec.type as unknown)
          : undefined;
        const attachmentUrl = attachmentRec
          ? (attachmentRec.url as unknown)
          : undefined;
        const attachmentName = attachmentRec
          ? (attachmentRec.name as unknown)
          : undefined;
        const attachmentSize = attachmentRec
          ? (attachmentRec.size as unknown)
          : undefined;

        const attachment =
          typeof attachmentType === 'string' &&
          (attachmentType === 'image' || attachmentType === 'file') &&
          typeof attachmentUrl === 'string'
            ? {
                type: attachmentType as 'image' | 'file',
                url: attachmentUrl,
                name:
                  typeof attachmentName === 'string'
                    ? attachmentName
                    : undefined,
                size:
                  typeof attachmentSize === 'number'
                    ? attachmentSize
                    : undefined,
              }
            : undefined;

        const created = await ChatService.sendMessageInDB(user, {
          conversationId,
          text: text ?? undefined,
          attachment,
        });

        chatNsp.to(conversationId).emit('chat:message:new', created);

        if (ack) {
          ack({
            success: true,
            message: 'Message sent successfully!',
            data: created,
          });
        }
      } catch (e) {
        ackError(ack, e);
      }
    });

    socket.on('chat:typing', async (payload: unknown) => {
      const conversationId = getStringField(payload, 'conversationId');
      const isTyping = getBooleanField(payload, 'isTyping') ?? false;
      if (!conversationId) return;

      socket.to(conversationId).emit('chat:typing', {
        conversationId,
        isTyping,
      });
    });

    socket.on(
      'chat:conversation:read',
      async (payload: unknown, ack?: Tack) => {
        try {
          if (!user) {
            throw new Error('You are not authorized!');
          }

          const conversationId = getStringField(payload, 'conversationId');
          if (!conversationId) {
            if (ack) {
              ack({
                success: false,
                message: 'conversationId is required!',
                errorSources: [
                  {
                    path: 'conversationId',
                    message: 'conversationId is required!',
                  },
                ],
              });
            }
            return;
          }

          const result = await ChatService.markReadInDB(user, conversationId);

          if (ack) {
            ack({
              success: true,
              message: 'Conversation marked as read!',
              data: result,
            });
          }
        } catch (e) {
          ackError(ack, e);
        }
      }
    );

    socket.on('chat:block', async (payload: unknown, ack?: Tack) => {
      try {
        if (!user) {
          throw new Error('You are not authorized!');
        }

        const userId = getStringField(payload, 'userId');
        const reason = getStringField(payload, 'reason');
        if (!userId) {
          if (ack) {
            ack({
              success: false,
              message: 'userId is required!',
              errorSources: [
                { path: 'userId', message: 'userId is required!' },
              ],
            });
          }
          return;
        }

        const result = await ChatService.blockUserInDB(user, {
          userId,
          reason,
        });
        if (ack) {
          ack({
            success: true,
            message: 'User blocked successfully!',
            data: result,
          });
        }
      } catch (e) {
        ackError(ack, e);
      }
    });

    // basic role based validation example (future use)
    void ROLE;
  });
};
