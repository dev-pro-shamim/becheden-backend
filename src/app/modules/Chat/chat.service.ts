import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { AppError } from '../../utils';
import { IUser } from '../User/user.interface';
import { AdModel } from '../Ad/ad.model';
import { ChatBlockModel, ConversationModel, MessageModel } from './chat.model';
import { ConversationReadModel } from './chatRead.model';
import { sendImageToCloudinary } from '../../lib';

type TPopulatedUser = {
  _id: Types.ObjectId;
  name?: string;
  image?: string;
};

type TPopulatedAd = {
  _id: Types.ObjectId;
  title?: string;
  price?: number;
  images?: string[];
};

type TConversationListItem = {
  id: Types.ObjectId;
  name: string;
  avatar: string | null;
  lastMessage: string | null;
  lastTime: Date;
  unreadCount: number;
  adSummary: {
    id: Types.ObjectId;
    title?: string;
    price?: number;
    image: string | null;
  } | null;
};

const ensureParticipant = async (
  userId: Types.ObjectId,
  conversationId: string
) => {
  if (!Types.ObjectId.isValid(conversationId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid conversationId!');
  }

  const conversation = await ConversationModel.findById(conversationId);
  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found!');
  }

  const isParticipant = conversation.participants
    .map((p) => String(p))
    .includes(String(userId));

  if (!isParticipant) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You are not a participant of this conversation!'
    );
  }

  return conversation;
};

const ensureNotBlocked = async (me: Types.ObjectId, other: Types.ObjectId) => {
  const blocked = await ChatBlockModel.findOne({
    $or: [
      { user: me, blockedUser: other },
      { user: other, blockedUser: me },
    ],
  }).lean();

  if (blocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'Chat is blocked between users!');
  }
};

const upsertConversationInDB = async (
  user: IUser,
  payload: { adId: string; participantId: string }
) => {
  const meId = new Types.ObjectId(user._id);

  if (!Types.ObjectId.isValid(payload.participantId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid participantId!');
  }
  const otherId = new Types.ObjectId(payload.participantId);

  if (String(meId) === String(otherId)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'participantId cannot be your own id!'
    );
  }

  await ensureNotBlocked(meId, otherId);

  let adObjectId: Types.ObjectId | null = null;
  if (payload.adId) {
    if (!Types.ObjectId.isValid(payload.adId)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid adId!');
    }
    const ad = await AdModel.findById(payload.adId).select('_id').lean();
    if (!ad) {
      throw new AppError(httpStatus.NOT_FOUND, 'Ad not found!');
    }
    adObjectId = ad._id as Types.ObjectId;
  }

  const existing = await ConversationModel.findOne({
    ad: adObjectId,
    participants: { $all: [meId, otherId] },
  });

  if (existing) return existing;

  const created = await ConversationModel.create({
    ad: adObjectId,
    participants: [meId, otherId],
  });

  return created;
};

const listMyConversationsFromDB = async (
  user: IUser,
  query: Record<string, unknown>
) => {
  const {
    searchTerm,
    page = 1,
    limit = 20,
  } = query as {
    searchTerm?: string;
    page?: string | number;
    limit?: string | number;
  };

  const meId = new Types.ObjectId(user._id);
  const skip = (Number(page) - 1) * Number(limit);

  const conversations = await ConversationModel.find({ participants: meId })
    .populate('participants', 'name image')
    .populate('ad', 'title price images')
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await ConversationModel.countDocuments({ participants: meId });

  const data: TConversationListItem[] = [];

  for (const conv of conversations) {
    const participants = conv.participants as unknown as TPopulatedUser[];
    const other = participants.find((p) => String(p._id) !== String(meId));

    if (searchTerm && other?.name) {
      const match = String(other.name)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!match) continue;
    }

    const read = await ConversationReadModel.findOne({
      conversation: conv._id,
      user: meId,
    }).lean();

    const lastReadAt = read?.lastReadAt ?? new Date(0);
    const unreadCount = await MessageModel.countDocuments({
      conversation: conv._id,
      createdAt: { $gt: lastReadAt },
      sender: { $ne: meId },
    });

    data.push({
      id: conv._id,
      name: other?.name ?? 'Unknown',
      avatar: other?.image ?? null,
      lastMessage: conv.lastMessageText ?? null,
      lastTime: conv.lastMessageAt ?? conv.updatedAt,
      unreadCount,
      adSummary: conv.ad
        ? (() => {
            const ad = conv.ad as unknown as TPopulatedAd;
            return {
              id: ad._id,
              title: ad.title,
              price: ad.price,
              image: ad.images?.[0] ?? null,
            };
          })()
        : null,
    });
  }

  return {
    data,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: total ? Math.ceil(total / Number(limit)) : 0,
    },
  };
};

const listMessagesFromDB = async (
  user: IUser,
  conversationId: string,
  query: Record<string, unknown>
) => {
  const {
    cursor,
    page,
    limit = 30,
  } = query as {
    cursor?: string;
    page?: string | number;
    limit?: string | number;
  };

  const meId = new Types.ObjectId(user._id);
  await ensureParticipant(meId, conversationId);

  const filter: Record<string, unknown> = {
    conversation: new Types.ObjectId(conversationId),
  };

  if (cursor && Types.ObjectId.isValid(cursor)) {
    const cursorMsg = await MessageModel.findById(cursor)
      .select('createdAt')
      .lean();
    if (cursorMsg?.createdAt) {
      filter.createdAt = { $lt: cursorMsg.createdAt };
    }
  }

  const skip = page ? (Number(page) - 1) * Number(limit) : 0;

  const messages = await MessageModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return messages;
};

const sendMessageInDB = async (
  user: IUser,
  payload: {
    conversationId: string;
    text?: string;
    attachment?: {
      type: 'image' | 'file';
      url: string;
      name?: string;
      size?: number;
    };
  }
) => {
  const meId = new Types.ObjectId(user._id);
  const conversation = await ensureParticipant(meId, payload.conversationId);

  const participants = conversation.participants as Types.ObjectId[];
  const otherId = participants.find((p) => String(p) !== String(meId));
  if (otherId) {
    await ensureNotBlocked(meId, otherId);
  }

  if (!payload.text && !payload.attachment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Message text or attachment is required!'
    );
  }

  const created = await MessageModel.create({
    conversation: conversation._id,
    sender: meId,
    text: payload.text ?? null,
    attachment: payload.attachment ?? null,
  });

  await ConversationModel.findByIdAndUpdate(conversation._id, {
    lastMessageText:
      payload.text ?? (payload.attachment ? '[Attachment]' : null),
    lastMessageAt: created.createdAt,
  });

  return created;
};

const markReadInDB = async (user: IUser, conversationId: string) => {
  const meId = new Types.ObjectId(user._id);
  await ensureParticipant(meId, conversationId);

  const updated = await ConversationReadModel.findOneAndUpdate(
    { conversation: new Types.ObjectId(conversationId), user: meId },
    { lastReadAt: new Date() },
    { upsert: true, new: true }
  );

  return updated;
};

const blockUserInDB = async (
  user: IUser,
  payload: { userId: string; reason?: string }
) => {
  const meId = new Types.ObjectId(user._id);

  if (!Types.ObjectId.isValid(payload.userId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid userId!');
  }
  const blockedUser = new Types.ObjectId(payload.userId);

  const created = await ChatBlockModel.findOneAndUpdate(
    { user: meId, blockedUser },
    { user: meId, blockedUser, reason: payload.reason ?? null },
    { upsert: true, new: true }
  );

  return created;
};

// uploadImageAttachmentIntoDB
const uploadImageAttachmentIntoDB = async (
  imageFile: Express.Multer.File | undefined
) => {
  if (!imageFile) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Attachment image is required!');
  }

  const upload = await sendImageToCloudinary(imageFile);

  if (!upload?.secure_url) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to upload attachment image!'
    );
  }

  const result = {
    url: upload.secure_url,
    publicId: upload.public_id,
    bytes: upload.bytes,
    format: upload.format,
    width: upload.width,
    height: upload.height,
    originalFilename: upload.original_filename,
  };

  return result;
};

export const ChatService = {
  upsertConversationInDB,
  listMyConversationsFromDB,
  listMessagesFromDB,
  sendMessageInDB,
  markReadInDB,
  blockUserInDB,
  ensureParticipant,
  uploadImageAttachmentIntoDB,
};
